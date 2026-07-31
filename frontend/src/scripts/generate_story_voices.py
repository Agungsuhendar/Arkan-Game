import os
import asyncio
import edge_tts

# Directory where generated MP3s will be saved
OUTPUT_DIR = "/Volumes/Data/Arkan Game/frontend/public/audio/stories"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Story narration data for each storybook (Pure story content & dialogue, without 'Bagian X' headers)
STORIES = [
    # Buku 7: Arkan si Pemberani Penolong Kucing Kecil
    {
        "book_id": "buku-7",
        "voice": "id-ID-ArdiNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {
                "page": 1,
                "text": "Suatu pagi, Arkan mendengar suara meong-meong di semak-semak. Arkan penasaran dan mencari dari mana suaranya. Arkan berkata: Suara apa itu, ya? Meong-meong?"
            },
            {
                "page": 2,
                "text": "Ternyata ada seekor anak kucing yang tersesat dan tidak bisa keluar dari semak. Ia terlihat takut dan lapar. Arkan berkata: Jangan takut, kucing kecil. Arkan akan tolong kamu."
            },
            {
                "page": 3,
                "text": "Arkan dengan hati-hati mengeluarkan kucing kecil itu dari semak-semak. Ia membawanya pulang dan memberinya makan serta minum. Arkan berkata: Ini susu dan makanan untukmu. Makan yang banyak ya, biar sehat!"
            },
            {
                "page": 4,
                "text": "Setelah makan, kucing kecil itu merasa lebih baik dan tidak takut lagi. Arkan memberinya nama Mimi. Arkan berkata: Hai, Mimi! Mulai sekarang kita berteman, ya!"
            },
            {
                "page": 5,
                "text": "Arkan merawat Mimi setiap hari. Mereka bermain bersama dan selalu menjaga kebersihan rumah. Arkan berkata: Yay! Seru sekali bermain bersama Mimi!"
            },
            {
                "page": 6,
                "text": "Arkan belajar bahwa menolong makhluk kecil adalah perbuatan yang baik. Mimi pun tumbuh sehat dan bahagia bersama Arkan. Arkan berkata: Aku senang dapat menolong Mimi. Berbuat baik membuat hati bahagia!"
            }
        ]
    },
    # Buku 6: Arkan dan Petualangan di Hutan Mini
    {
        "book_id": "buku-6",
        "voice": "id-ID-GadisNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {
                "page": 1,
                "text": "Hari Minggu, Arkan dan Mama berkunjung ke Hutan Mini di kota. Arkan sangat senang karena bisa melihat banyak hewan! Arkan berkata: Wah! Lihat itu, Mama! Kelinci! Lucu sekali!"
            },
            {
                "page": 2,
                "text": "Tiba-tiba, Arkan melihat anak burung di bawah pohon. Anak burung itu sepertinya jatuh dari sarangnya. Arkan berkata: Aduh... kamu kenapa sendirian di sini?"
            },
            {
                "page": 3,
                "text": "Arkan tidak tega. Ia memanggil petugas Hutan Mini dan memberi tahu kejadian itu. Arkan berkata: Pak, ada anak burung yang jatuh dari sarangnya."
            },
            {
                "page": 4,
                "text": "Petugas bersama Arkan mengembalikan anak burung itu ke sarangnya yang aman. Pak Petugas berkata: Sekarang kamu aman ya, Nak. Hati-hati ya!"
            },
            {
                "page": 5,
                "text": "Sebagai tanda terima kasih, Mama membelikan es krim favorit Arkan. Arkan senang sekali! Arkan berkata: Terima kasih Mama! Hari ini menyenangkan sekali!"
            },
            {
                "page": 6,
                "text": "Arkan belajar bahwa menolong makhluk kecil adalah perbuatan baik. Ia berjanji akan selalu menjaga dan menyayangi hewan. Arkan berkata: Aku akan selalu menjaga mereka. Semua makhluk hidup berhak bahagia!"
            }
        ]
    },
    # Buku 5: Arkan Olahraga Pagi Sama Mama
    {
        "book_id": "buku-5",
        "voice": "id-ID-GadisNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {
                "page": 1,
                "text": "Pagi-pagi Arkan bangun dengan semangat. Arkan siap olahraga bersama Mama! Arkan berkata: Yay! Hari ini olahraga pagi sama Mama!"
            },
            {
                "page": 2,
                "text": "Mama mengajak Arkan pemanasan terlebih dahulu agar tubuh tidak kaku. Mama berkata: Pemanasan yuk, biar badan kita sehat!"
            },
            {
                "page": 3,
                "text": "Arkan berlari-lari kecil mengelilingi taman. Arkan tertawa riang! Arkan berkata: Whee... asyik sekali!"
            },
            {
                "page": 4,
                "text": "Setelah itu, mereka jalan santai dan bersepeda bersama. Udara pagi terasa segar! Arkan berkata: Seru banget olahraga sama Mama!"
            },
            {
                "page": 5,
                "text": "Setelah olahraga, Arkan minum air putih dan makan buah. Tubuh jadi segar dan berenergi! Arkan berkata: Segar dan berenergi!"
            },
            {
                "page": 6,
                "text": "Arkan dan Mama berjanji untuk selalu rajin berolahraga. Tubuh sehat, hati pun senang! Arkan berkata: Arkan mau rajin olahraga setiap hari!"
            }
        ]
    },
    # Buku 1: Petualangan Arkan di Hutan Angka
    {
        "book_id": "buku-1",
        "voice": "id-ID-ArdiNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {
                "page": 1,
                "text": "Suatu hari yang cerah, Arkan berjalan memasuki Hutan Angka yang ajaib. Pohon-pohon di sana berbuah angka warna-warni!"
            },
            {
                "page": 2,
                "text": "Arkan menemukan pohon apel merah. Arkan membantu kelinci menghitung satu, dua, tiga, empat, lima apel lezat!"
            },
            {
                "page": 3,
                "text": "Untuk menyeberangi sungai, Arkan melompati batu berangka secara berurutan. Satu, dua, tiga, melompat!"
            },
            {
                "page": 4,
                "text": "Di puncak bukit, Arkan menemukan peti harta karun berisi bintang-bintang emas atas keberhasilannya!"
            }
        ]
    },
    # Buku 2: Istana Warna Ajaib
    {
        "book_id": "buku-2",
        "voice": "id-ID-GadisNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {
                "page": 1,
                "text": "Arkan memasuki Istana Warna yang megah. Temboknya berwarna merah, biru, kuning, dan hijau!"
            },
            {
                "page": 2,
                "text": "Burung merpati mengajak Arkan melukis garis-garis pelangi indah di angkasa."
            },
            {
                "page": 3,
                "text": "Semua sahabat binatang menari gembira merayakan keindahan warna-warni di istana."
            }
        ]
    },
    # Buku 3: Misteri Pulau Satwa
    {
        "book_id": "buku-3",
        "voice": "id-ID-ArdiNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {
                "page": 1,
                "text": "Arkan berlayar menggunakan perahu kayu menuju Pulau Satwa yang rindang."
            },
            {
                "page": 2,
                "text": "Arkan menyapa Raja Singa yang ramah dan mendengarkan suaranya yang berwibawa."
            },
            {
                "page": 3,
                "text": "Arkan dan para binatang berjanji untuk selalu menjaga kebersihan dan kelestarian pulau."
            }
        ]
    },
    # Buku 4: Arkan si Penjelajah Angkasa
    {
        "book_id": "buku-4",
        "voice": "id-ID-ArdiNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {
                "page": 1,
                "text": "Arkan memakai baju astronot dan siap meluncur ke luar angkasa. Tiga, dua, satu, meluncur!"
            },
            {
                "page": 2,
                "text": "Di antariksa, Arkan melihat bulan bersinar terang dan planet-planet berputar indah."
            },
            {
                "page": 3,
                "text": "Arkan pulang mendarat di bumi membawa cerita pengetahuan yang menakjubkan."
            }
        ]
    }
]

async def generate_all():
    for story in STORIES:
        book_id = story["book_id"]
        voice = story["voice"]
        rate = story["rate"]
        pitch = story["pitch"]
        for p in story["pages"]:
            page_num = p["page"]
            text = p["text"]
            filename = f"{book_id}_p{page_num}.mp3"
            filepath = os.path.join(OUTPUT_DIR, filename)
            
            print(f"Generating pure story voice: {filename}...")
            communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            await communicate.save(filepath)
            print(f"Saved: {filepath}")

if __name__ == "__main__":
    asyncio.run(generate_all())
