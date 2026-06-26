/* =========================================================================
   BHAKTI DHAM — SONGS DATABASE
   ========================================================================= */
const songs = [
  {
    id: 1,
    title: "Shiv Tandav Stotram",
    artist: "Ravana Kritam • Traditional",
    deity: "Shiva",
    tag: "Shiva",
    durationLabel: "6:12",
    image: "https://images.pexels.com/photos/14064750/pexels-photo-14064750.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=720",
    audio: "public/songs/Shiv Tandav Stotram.mp3"
  },
  {
    id: 2,
    title: "Hanuman Chalisa",
    artist: "Tulsidas • Sureshanandji",
    deity: "Hanuman",
    tag: "Hanuman",
    durationLabel: "7:44",
    image: "https://images.pexels.com/photos/3519190/pexels-photo-3519190.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=720",
    audio: "public/songs/hanuman chalisa.mp3"
  },
  {
    id: 3,
    title: "Om Namah Shivaya",
    artist: "Vedic Chant • 108 Japa",
    deity: "Shiva",
    tag: "Mantra",
    durationLabel: "5:38",
    image: "https://images.pexels.com/photos/18290864/pexels-photo-18290864.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=720",
    audio: "public/songs/Om Namah Shivay Dhun 108 Times.mp3"
  },
  {
    id: 4,
    title: "Mahamrityunjaya Mantra",
    artist: "Rigveda • Tryambakam",
    deity: "Shiva",
    tag: "Mantra",
    durationLabel: "4:22",
    image: "https://images.pexels.com/photos/29806359/pexels-photo-29806359.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=720",
    audio: "https://archive.org/download/shivamantrasandsongs/Om%20namah%20shivaya%202.mp3"
  }
];

/* =========================
   SPA PAGE ROUTING SYSTEM
   ========================= */
let currentPage = 'home';

function navigateTo(pageId) {
  // Update state
  currentPage = pageId;

  // Toggle active containers
  document.querySelectorAll('.page-container').forEach(container => {
    container.classList.remove('page-active');
  });
  const activeContainer = document.getElementById(`page-${pageId}`);
  if (activeContainer) {
    activeContainer.classList.add('page-active');
  }

  // Toggle active tab buttons in navbar
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  const activeTab = document.getElementById(`nav-${pageId}`);
  if (activeTab) {
    activeTab.classList.add('active');
  }

  // Update hash safely
  window.history.replaceState(null, null, `#${pageId}`);

  // Scroll smoothly to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile menu if open
  document.getElementById('mobileMenu').classList.add('hidden');
}

// Router init on load / hash change
function handleHashRoute() {
  const hash = window.location.hash.replace('#', '');
  if (['home', 'bhajans', 'about'].includes(hash)) {
    navigateTo(hash);
  } else {
    navigateTo('home');
  }
}

/* =========================
   PLAYER STATE
   ========================= */
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let prevVolume = 0.85;
let filteredSongs = [...songs];


const audio = document.getElementById('audioEl');
audio.volume = prevVolume;

/* =========================
   DOM REFS
   ========================= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const songGrid = $('#songGrid');
const searchInput = $('#searchInput');
const clearSearchBtn = $('#clearSearch');
const noResults = $('#noResults');
const playerBar = $('#audioPlayerBar');
const playerArt = $('#playerArt');
const playerTitle = $('#playerTitle');
const playerArtist = $('#playerArtist');
const playPauseBtn = $('#playPauseBtn');
const playIcon = $('#playIcon');
const pauseIcon = $('#pauseIcon');
const progressTrack = $('#progressTrack');
const progressFill = $('#progressFill');
const currentTimeEl = $('#currentTime');
const totalTimeEl = $('#totalTime');
const volumeSlider = $('#volumeSlider');
const muteBtn = $('#muteBtn');
const repeatBtn = $('#repeatBtn');
const shuffleBtn = $('#shuffleBtn');
const queueBtn = $('#queueBtn');
const queuePopover = $('#queuePopover');
const queueList = $('#queueList');
const toastEl = $('#toast');


/* =========================
   THEME SWITCHING (LIGHT/DARK)
   ========================= */
const themeToggle = $('#themeToggle');
const html = document.documentElement;
const savedTheme = localStorage.getItem('bhakti-dham-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcons();

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('bhakti-dham-theme', next);
  updateThemeIcons();
});

function updateThemeIcons() {
  const iconL = themeToggle.querySelector('.theme-icon-light');
  const iconD = themeToggle.querySelector('.theme-icon-dark');
  const isLight = html.getAttribute('data-theme') === 'light';
  if (iconL) iconL.style.display = isLight ? 'inline' : 'none';
  if (iconD) iconD.style.display = isLight ? 'none' : 'inline';
}

/* =========================
   RENDER CARDS (BHAJANS TAB)
   ========================= */
function renderCards(list) {
  if (!songGrid) return;
  songGrid.innerHTML = '';
  if (!list || list.length === 0) {
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');
  list.forEach((song, i) => {
    const gIdx = songs.findIndex(s => s.id === song.id);
    const card = document.createElement('article');
    card.className = 'bhajan-card group rounded-[26px] overflow-hidden fade-up';
    card.style.animationDelay = (i * 60) + 'ms';
    card.innerHTML = `
      <div class="relative aspect-[4/3] overflow-hidden" style="background:var(--progress-track);">
        <img src="${song.image}" alt="${song.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.045]">
        <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/14 to-transparent"></div>
        <div class="absolute top-[13px] left-[14px]">
          <span class="text-[11px] px-[10px] py-[5px] rounded-full bg-white/92 text-[#9a4c14] font-[550] tracking-wide border border-[#f6d6a9] shadow-sm">${song.tag}</span>
        </div>
        <div class="absolute bottom-[13px] right-[14px] text-[11.5px] px-[9px] py-[4px] rounded-full bg-black/45 text-white backdrop-blur-sm tabular-nums">${song.durationLabel}</div>
        <button data-play="${gIdx}" class="play-card-btn absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[64px] h-[64px] rounded-full bg-white/96 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,.28)] hover:scale-105 transition opacity-0 group-hover:opacity-100 cursor-pointer" style="color:#d75a09;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19"/></svg>
        </button>
      </div>
      <div class="p-[18px] sm:p-[20px] text-center">
        <div class="text-[18px] font-[620] leading-snug truncate" style="color:var(--text-card-title);">${song.title}</div>
        <div class="text-[13px] mt-1 truncate mb-3" style="color:var(--text-card-artist);">${song.artist}</div>
        <button data-play="${gIdx}" class="play-inline ripple w-full text-white text-[13.5px] font-[560] py-[11px] rounded-[14px] btn-saffron transition cursor-pointer">▶ Play Song</button>
      </div>`;
    songGrid.appendChild(card);
  });
}

/* click delegation on grid */
if (songGrid) {
  songGrid.addEventListener('click', (e) => {
    const p = e.target.closest('[data-play]');
    if (p) { loadAndPlay(+p.dataset.play); }
  });
}

/* =========================
   PLAYER CORE LOGIC
   ========================= */
function loadSong(idx, autoplay = false) {
  if (idx < 0 || idx >= songs.length) return;
  currentIndex = idx;
  const s = songs[currentIndex];
  audio.src = s.audio;
  audio.load();
  playerArt.src = s.image;
  playerTitle.textContent = s.title;
  playerArtist.textContent = s.artist;
  playerBar.classList.remove('translate-y-[110%]');
  updateMediaSession();



  if (autoplay) { audio.play().then(() => { isPlaying = true; updatePlayUI(); }).catch(() => { }); }
}

function loadAndPlay(idx) { loadSong(idx, true); }

function togglePlay() {
  if (!audio.src) { loadSong(0, true); return; }
  audio.paused ? audio.play() : audio.pause();
}

function updatePlayUI() {
  if (isPlaying) { playIcon.classList.add('hidden'); pauseIcon.classList.remove('hidden'); }
  else { playIcon.classList.remove('hidden'); pauseIcon.classList.add('hidden'); }
}

function nextTrack() {
  if (isShuffle) {
    let n; do { n = Math.floor(Math.random() * songs.length); } while (songs.length > 1 && n === currentIndex);
    loadSong(n, true);
  } else { loadSong((currentIndex + 1) % songs.length, true); }
}

function prevTrack() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  loadSong((currentIndex - 1 + songs.length) % songs.length, true);
}

function formatTime(sec) {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

/* Audio listener bindings */
audio.addEventListener('play', () => { isPlaying = true; updatePlayUI(); });
audio.addEventListener('pause', () => { isPlaying = false; updatePlayUI(); });
audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    progressFill.style.width = (audio.currentTime / audio.duration) * 100 + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);

  }
});
audio.addEventListener('loadedmetadata', () => {
  totalTimeEl.textContent = formatTime(audio.duration || 0);
});
audio.addEventListener('ended', () => {
  if (isRepeat) { audio.currentTime = 0; audio.play(); } else { nextTrack(); }
});
audio.addEventListener('error', () => showToast('⚠️ Audio stream loaded offline fallback'));

/* Transport bindings */
playPauseBtn.addEventListener('click', togglePlay);
$('#nextBtn').addEventListener('click', nextTrack);
$('#prevBtn').addEventListener('click', prevTrack);
progressTrack.addEventListener('click', (e) => {
  if (!audio.duration) return;
  const rect = progressTrack.getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
});
volumeSlider.addEventListener('input', e => { audio.volume = e.target.value; audio.muted = false; });
muteBtn.addEventListener('click', () => {
  audio.muted = !audio.muted;
});
repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat; repeatBtn.style.color = isRepeat ? '#E65100' : 'var(--text-subtle)'; showToast(isRepeat ? '🔂 Repeat on' : 'Repeat off');
});
shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle; shuffleBtn.style.color = isShuffle ? '#E65100' : 'var(--text-subtle)'; showToast(isShuffle ? '🔀 Shuffle on' : 'Shuffle off');
});

/* =========================
   SEARCH + FILTER PILLS
   ========================= */
if (searchInput) {
  searchInput.addEventListener('input', applyFilters);
}
if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', () => { searchInput.value = ''; applyFilters(); searchInput.focus(); });
}

$$('#filterPills .section-tab').forEach(pill => {
  pill.addEventListener('click', () => {
    $$('#filterPills .section-tab').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    applyFilters();
  });
});

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  clearSearchBtn.classList.toggle('hidden', !q);
  const activeTag = $('#filterPills .section-tab.active')?.dataset.tag || 'all';
  filteredSongs = songs.filter(s => {
    const m = !q || [s.title, s.artist, s.deity, s.tag].some(v => v.toLowerCase().includes(q));
    const t = activeTag === 'all' || s.tag === activeTag;
    return m && t;
  });
  renderCards(filteredSongs);
}

/* =========================
   NAVBAR & MENU
   ========================= */
const navbar = $('#navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('nav-scrolled', window.scrollY > 22);
});

/* Mobile menu trigger */
const mobileMenuBtn = $('#mobileMenuBtn');
const mobileMenu = $('#mobileMenu');
mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

/* =========================
   KEYBOARD SHORTCUTS
   ========================= */
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  switch (e.code) {
    case 'Space': e.preventDefault(); togglePlay(); break;
    case 'ArrowRight': nextTrack(); break;
    case 'ArrowLeft': prevTrack(); break;
    default:
      if (e.key.toLowerCase() === 'r') repeatBtn.click();
      if (e.key.toLowerCase() === 's') shuffleBtn.click();
  }
});

/* Search redirect shortcut */
$('#navSearchBtn')?.addEventListener('click', () => {
  navigateTo('bhajans');
  setTimeout(() => searchInput.focus(), 350);
});

/* =========================
   RIPPLE EFFECT
   ========================= */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.ripple');
  if (!btn) return;
  const circle = document.createElement('span');
  const d = Math.max(btn.clientWidth, btn.clientHeight);
  const rect = btn.getBoundingClientRect();
  circle.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - rect.left - d / 2}px;top:${e.clientY - rect.top - d / 2}px`;
  circle.className = 'ripple-effect';
  const old = btn.querySelector('.ripple-effect');
  if (old) old.remove();
  btn.appendChild(circle);
});

/* =========================
   QUEUE POPOVER
   ========================= */
queueBtn?.addEventListener('click', () => {
  queueList.innerHTML = songs.map((s, i) => `
    <button class="w-full text-left px-4 py-[11px] flex items-center gap-3 transition cursor-pointer" style="background:${i === currentIndex ? 'var(--bg-chips-active)' : 'transparent'};" data-qidx="${i}">
      <img src="${s.image}" class="w-9 h-9 rounded-lg object-cover flex-shrink-0">
      <span class="flex-1 truncate" style="color:var(--text-card-title);">${s.title}
        <div class="text-[11px]" style="color:var(--text-subtle);">${s.deity}</div>
      </span>
      <span class="text-[11px]" style="color:var(--text-subtle);">${s.durationLabel}</span>
    </button>
  `).join('');
  queuePopover.classList.toggle('hidden');
  queueList.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => { loadAndPlay(+b.dataset.qidx); queuePopover.classList.add('hidden'); });
  });
});
document.addEventListener('click', e => {
  if (!queuePopover.contains(e.target) && e.target !== queueBtn) queuePopover.classList.add('hidden');
});

/* =========================
   TOAST SYSTEM
   ========================= */
let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.style.opacity = '0', 1800);
}

/* =========================
   MEDIA SESSION API
   ========================= */
function updateMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const s = songs[currentIndex];
  navigator.mediaSession.metadata = new MediaMetadata({
    title: s.title,
    artist: s.artist,
    album: 'Bhakti Dham',
    artwork: [{ src: s.image, sizes: '512x512', type: 'image/jpeg' }]
  });
  navigator.mediaSession.setActionHandler('play', () => audio.play());
  navigator.mediaSession.setActionHandler('pause', () => audio.pause());
  navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
  navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
}



/* =========================
   INIT ROUTING
   ========================= */
window.addEventListener('hashchange', handleHashRoute);
handleHashRoute();

// Render songs immediately
renderCards(songs);
loadSong(0, false);
