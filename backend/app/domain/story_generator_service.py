import random
import time
from typing import Dict, Any, List

class StoryGeneratorService:
    """
    Service to generate structured educational fairytale storybooks for Arkan Game.
    Produces rich, child-friendly 5-page storybooks in Bahasa Indonesia with
    dialogues, moral missions, page emojis, and background color gradients.
    """

    IMAGE_POOL = [
        "/arkan_cat_dino.png",
        "/arkan_hutan_1.png",
        "/arkan_burung_1.jpg",
        "/arkan_baik_hati_1.jpg",
        "/arkan_olahraga_1.png",
        "/arkan_sepeda_1.png",
        "/arkan_toples_1.png",
    ]

    GRADIENT_POOL = [
        "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)",
        "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
        "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
        "linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)",
        "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
    ]

    EMOJI_POOLS = {
        "dino": ["🦖", "🌳", "✨", "🦕", "🏞️"],
        "robot": ["🤖", "🚀", "⚡", "🛸", "🌟"],
        "hewan": ["🐱", "🐶", "🐰", "🦁", "💖"],
        "default": ["✨", "📖", "🌟", "💖", "🌈"]
    }

    @classmethod
    def generate_story(cls, topic: str, moral_value: str, category: str = "Petualangan 🚩", target_age: int = 4) -> Dict[str, Any]:
        timestamp_id = int(time.time())
        clean_topic = topic.strip() or "Petualangan Arkan yang Menyenangkan"
        clean_moral = moral_value.strip() or "Suka Menolong & Menyayangi Sesama"
        
        title = f"Arkan dan {clean_topic}"
        if "arkan" in clean_topic.lower():
            title = clean_topic.capitalize()

        story_id = f"buku-ai-{timestamp_id}"

        # Choose emoji set
        topic_lower = clean_topic.lower()
        if "dino" in topic_lower or "dinosaurus" in topic_lower:
            emojis = cls.EMOJI_POOLS["dino"]
            cover_img = "/arkan_cat_dino.png"
        elif "robot" in topic_lower or "sains" in topic_lower or "luar angkasa" in topic_lower:
            emojis = cls.EMOJI_POOLS["robot"]
            cover_img = "/arkan_character.png"
        elif "kucing" in topic_lower or "hewan" in topic_lower or "burung" in topic_lower:
            emojis = cls.EMOJI_POOLS["hewan"]
            cover_img = "/arkan_kucing_1.png"
        else:
            emojis = cls.EMOJI_POOLS["default"]
            cover_img = random.choice(cls.IMAGE_POOL)

        pages = [
            {
                "pageNumber": 1,
                "title": f"Bagian 1: Hari Baru Bersama {clean_topic}",
                "subtitle": "Awal dari Kisah Seru",
                "image": "/arkan_baik_hati_1.jpg",
                "badge": "Pagi Ceria",
                "badgeColor": "bg-amber-8",
                "dialogueSpeaker": "Arkan",
                "dialogueText": f"Wah! Hari ini aku siap berpetualang dan belajar tentang {clean_topic}!",
                "storyContent": f"Di pagi hari yang cerah, Arkan terbangun dengan senyuman lebar. Hari ini Arkan ingin belajar hal baru tentang {clean_topic}.",
                "missionText": f"🌅 Semangat Belajar {clean_topic}",
                "bgGradient": cls.GRADIENT_POOL[0],
                "emoji": f"{emojis[0]} 🌅 {emojis[1]}"
            },
            {
                "pageNumber": 2,
                "title": "Bagian 2: Pertemuan yang Berkesan",
                "subtitle": "Teman Baru & Pengalaman Menarik",
                "image": cover_img,
                "badge": "Mulai Berpetualang",
                "badgeColor": "bg-blue-8",
                "dialogueSpeaker": "Teman Baru",
                "dialogueText": "Halo Arkan! Bersama-sama kita pasti bisa melakukan hal hebat!",
                "storyContent": f"Saat berjalan di dekat taman, Arkan menemukan keajaiban kecil. Arkan belajar bahwa {clean_topic} mengajarkan kita untuk selalu bersikap baik.",
                "missionText": f"🤝 {clean_moral}",
                "bgGradient": cls.GRADIENT_POOL[1],
                "emoji": f"{emojis[1]} 🤝 {emojis[2]}"
            },
            {
                "pageNumber": 3,
                "title": "Bagian 3: Tantangan Kebaikan",
                "subtitle": "Keberanian & Ketulusan Hati",
                "image": "/arkan_hutan_3.png",
                "badge": "Tantangan Seru",
                "badgeColor": "bg-purple-8",
                "dialogueSpeaker": "Arkan",
                "dialogueText": "Jangan khawatir! Aku akan menolongmu dengan tulus!",
                "storyContent": f"Ada tantangan kecil yang dihadapi di jalan. Tapi dengan keberanian dan pesan moral '{clean_moral}', Arkan berhasil melaluinya dengan baik.",
                "missionText": f"💖 Tunjukkan {clean_moral}",
                "bgGradient": cls.GRADIENT_POOL[2],
                "emoji": f"{emojis[2]} 💖 {emojis[3]}"
            },
            {
                "pageNumber": 4,
                "title": "Bagian 4: Kebahagiaan Bersama",
                "subtitle": "Buah dari Kebaikan Hati",
                "image": "/arkan_toples_4.png",
                "badge": "Kebahagiaan",
                "badgeColor": "bg-emerald-8",
                "dialogueSpeaker": "Mama & Papa",
                "dialogueText": "Anak pintar! Mama dan Papa bangga sekali padamu, Arkan!",
                "storyContent": f"Semua orang tersenyum gembira melihat kebaikan Arkan. Arkan merasa hatinya hangat dan sangat bersyukur.",
                "missionText": "🌟 Menebar Senyuman & Kebahagiaan",
                "bgGradient": cls.GRADIENT_POOL[3],
                "emoji": f"{emojis[3]} ✨ 😊"
            },
            {
                "pageNumber": 5,
                "title": "Bagian 5: Pesan Moral untuk Teman-Teman",
                "subtitle": "Inspirasi Setiap Hari",
                "image": "/arkan_baik_hati_6.jpg",
                "badge": "Pesan Dongeng AI",
                "badgeColor": "bg-pink-8",
                "dialogueSpeaker": "Arkan",
                "dialogueText": f"Ingat ya teman-teman, mari kita selalu menerapkan {clean_moral} setiap hari!",
                "storyContent": f"Arkan menutup hari dengan penuh syukur. Arkan berjanji akan terus berbuat baik, rajin belajar, dan menyayangi sesama.",
                "missionText": f"📜 Pesan Dongeng: {clean_moral}",
                "bgGradient": cls.GRADIENT_POOL[4],
                "emoji": "🌟 💖 🌍"
            }
        ]

        return {
            "id": story_id,
            "title": title,
            "subtitle": f"Cerita Dongeng AI untuk Usia {target_age} Tahun",
            "coverImage": cover_img,
            "category": category,
            "badge": "✨ Dibuat AI",
            "badgeColor": "bg-purple-8",
            "readTime": "3 Menit",
            "summary": f"Kisah ajaib buatan AI tentang {clean_topic} yang mengajari Arkan dan teman-teman tentang nilai moral {clean_moral}.",
            "pages": pages
        }
