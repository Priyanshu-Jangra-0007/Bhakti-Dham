import os
import sys
import json
import argparse
import torch
import whisperx

def main():
    parser = argparse.ArgumentParser(description="Generate synchronized lyrics using WhisperX.")
    parser.add_argument("--model", type=str, default="tiny", help="Whisper model size to use (e.g. tiny, base, small, medium, large-v3)")
    parser.add_argument("--songs_dir", type=str, default="public/songs", help="Path to directory containing MP3 files")
    parser.add_argument("--lyrics_dir", type=str, default="public/lyrics", help="Path to directory where JSON lyrics will be saved")
    parser.add_argument("--device", type=str, default="cpu", help="Device to use for computation (cpu or cuda)")
    parser.add_argument("--compute_type", type=str, default="int8", help="Compute type (float16, float32, int8)")
    parser.add_argument("--language", type=str, default=None, help="Explicit language code (e.g. 'hi' for Hindi, 'en' for English). If None, detects automatically.")

    args = parser.parse_args()

    # Ensure output directory exists
    os.makedirs(args.lyrics_dir, exist_ok=True)

    if not os.path.isdir(args.songs_dir):
        print(f"Error: Songs directory '{args.songs_dir}' does not exist.")
        sys.exit(1)

    # Scan for MP3 files
    mp3_files = [f for f in os.listdir(args.songs_dir) if f.lower().endswith(".mp3")]
    if not mp3_files:
        print(f"No MP3 files found in '{args.songs_dir}'.")
        return

    print(f"Found {len(mp3_files)} MP3 file(s) in '{args.songs_dir}'.")

    # Filter out files that already have lyrics
    todo_files = []
    for f in mp3_files:
        base_name = os.path.splitext(f)[0]
        json_path = os.path.join(args.lyrics_dir, f"{base_name}.json")
        if os.path.exists(json_path):
            print(f"Skipping '{f}' (lyrics JSON already exists at '{json_path}').")
        else:
            todo_files.append(f)

    if not todo_files:
        print("All songs already have lyrics generated. Nothing to do.")
        return

    print(f"Generating lyrics for {len(todo_files)} file(s)...")

    # Load WhisperX transcription model
    print(f"Loading WhisperX model '{args.model}' on '{args.device}' (compute_type: '{args.compute_type}')...")
    try:
        model = whisperx.load_model(args.model, args.device, compute_type=args.compute_type)
    except Exception as e:
        print(f"Failed to load WhisperX model: {e}")
        print("Make sure PyTorch and WhisperX dependencies are installed correctly.")
        sys.exit(1)

    # Process each file
    for mp3_file in todo_files:
        mp3_path = os.path.join(args.songs_dir, mp3_file)
        base_name = os.path.splitext(mp3_file)[0]
        json_path = os.path.join(args.lyrics_dir, f"{base_name}.json")

        print(f"\nProcessing '{mp3_file}'...")

        try:
            # 1. Transcribe audio
            print(f"Transcribing audio...")
            audio = whisperx.load_audio(mp3_path)
            
            # Use batch_size=4 or 16. On CPU, small batch size is safer
            batch_size = 4 if args.device == "cpu" else 16
            
            transcribe_options = {}
            if args.language:
                transcribe_options["language"] = args.language
                
            result = model.transcribe(audio, batch_size=batch_size, **transcribe_options)
            
            detected_language = result.get("language", "en")
            print(f"Transcription complete. Language: '{detected_language}'")

            # 2. Forced Alignment (Word-level timestamps)
            print(f"Aligning transcript to get word-level timestamps...")
            model_a, metadata = whisperx.load_align_model(language_code=detected_language, device=args.device)
            alignment_result = whisperx.align(
                result["segments"], 
                model_a, 
                metadata, 
                audio, 
                args.device, 
                return_char_alignments=False
            )

            # 3. Extract and format word-level timestamps
            words_timestamps = []
            for segment in alignment_result.get("segments", []):
                for word_info in segment.get("words", []):
                    # Only include words that have successful start and end timestamps
                    if "word" in word_info and "start" in word_info and "end" in word_info:
                        words_timestamps.append({
                            "word": word_info["word"],
                            "start": float(word_info["start"]),
                            "end": float(word_info["end"])
                        })
                    elif "word" in word_info:
                        # Fallback for unaligned words (can approximate or skip)
                        # We skip to ensure strict adherence to format with start/end
                        pass

            # Write JSON output
            with open(json_path, "w", encoding="utf-8") as out_f:
                json.dump(words_timestamps, out_f, indent=2, ensure_ascii=False)
            
            print(f"Successfully generated lyrics for '{mp3_file}' -> '{json_path}'")

        except Exception as e:
            print(f"Error processing '{mp3_file}': {e}")
            print("Skipping and continuing to next song...")

    print("\nAll done!")

if __name__ == "__main__":
    main()
