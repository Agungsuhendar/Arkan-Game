import os
import asyncio
import edge_tts

OUTPUT_DIR = "/Volumes/Data/Arkan Game/frontend/public/audio/voices"
os.makedirs(OUTPUT_DIR, exist_ok=True)

HOMEBASE_VOICES = [
    {
        "filename": "arkan_greeting.mp3",
        "voice": "id-ID-ArdiNeural",
        "rate": "+0%",
        "pitch": "+3Hz",
        "text": "Hai! Namaku Arkan! Ayo kawan, kita belajar dan bermain game seru bersama-sama!"
    },
    {
        "filename": "mimi_cat.mp3",
        "voice": "id-ID-GadisNeural",
        "rate": "+6%",
        "pitch": "+8Hz",
        "text": "Meong! Meong! Nyao! Aku Mimi si kucing imut, meong meong! Siap menemanimu bermain!"
    },
    {
        "filename": "dino_friend.mp3",
        "voice": "id-ID-ArdiNeural",
        "rate": "-8%",
        "pitch": "-4Hz",
        "text": "Rawr! Rawr! Aku Dino si Dinosaurus pemberani. Aku sangat suka musik dan petualangan di Pulau Langit!"
    },
    {
        "filename": "chest_reward.mp3",
        "voice": "id-ID-GadisNeural",
        "rate": "-3%",
        "pitch": "+2Hz",
        "text": "Wah! Ada hadiah dan koin kebaikan menunggumu! Ayo buka peti harta karun!"
    },
    {
        "filename": "theme_day.mp3",
        "voice": "id-ID-GadisNeural",
        "rate": "-5%",
        "pitch": "+1Hz",
        "text": "Mode Suasana Siang Hari!"
    },
    {
        "filename": "theme_night.mp3",
        "voice": "id-ID-GadisNeural",
        "rate": "-5%",
        "pitch": "+1Hz",
        "text": "Mode Suasana Malam Hari!"
    },
    {
        "filename": "theme_auto.mp3",
        "voice": "id-ID-GadisNeural",
        "rate": "-5%",
        "pitch": "+1Hz",
        "text": "Mode Suasana Otomatis Jam Real Time!"
    }
]

async def generate_voice(item):
    filepath = os.path.join(OUTPUT_DIR, item["filename"])
    print(f"Generating studio AI voice: {item['filename']} -> {item['text']}")
    communicate = edge_tts.Communicate(
        text=item["text"],
        voice=item["voice"],
        rate=item["rate"],
        pitch=item["pitch"]
    )
    await communicate.save(filepath)
    print(f"SUCCESS: Generated {filepath}")

async def main():
    print("=== Generating High Quality Studio AI Voices for HomeBase Characters ===")
    for item in HOMEBASE_VOICES:
        await generate_voice(item)
    print("=== All HomeBase Studio AI Voices Generated Successfully ===")

if __name__ == "__main__":
    asyncio.run(main())
