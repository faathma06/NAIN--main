import torch
from transformers import pipeline

print("Loading Whisper Small model...")

speech_to_text = pipeline(
"automatic-speech-recognition",
model="openai/whisper-small",
device="cuda:0" if torch.cuda.is_available() else "cpu"
)

print("Whisper Small loaded successfully!")
print("Give an audio file path to test.")

audio_path = input("Audio file path: ").strip().strip('"')

result = speech_to_text(audio_path)

print("\nRecognized speech:")
print(result["text"])