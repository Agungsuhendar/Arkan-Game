import os
import asyncio
import edge_tts

OUTPUT_DIR = "/Volumes/Data/Arkan Game/frontend/public/audio/stories"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Complete 11 Storybooks Narration Dataset (54 pages total)
STORIES = [
    # Buku 7: Arkan si Pemberani Penolong Kucing Kecil
    {
        "book_id": "buku-7",
        "voice": "id-ID-ArdiNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {"page": 1, "text": "Suatu pagi, Arkan mendengar suara meong-meong di semak-semak. Arkan penasaran dan mencari dari mana suaranya. Arkan berkata: Suara apa itu, ya? Meong-meong?"},
            {"page": 2, "text": "Ternyata ada seekor anak kucing yang tersesat dan tidak bisa keluar dari semak. Ia terlihat takut dan lapar. Arkan berkata: Jangan takut, kucing kecil. Arkan akan tolong kamu."},
            {"page": 3, "text": "Arkan dengan hati-hati mengeluarkan kucing kecil itu dari semak-semak. Ia membawanya pulang dan memberinya makan serta minum. Arkan berkata: Ini susu dan makanan untukmu. Makan yang banyak ya, biar sehat!"},
            {"page": 4, "text": "Setelah makan, kucing kecil itu merasa lebih baik dan tidak takut lagi. Arkan memberinya nama Mimi. Arkan berkata: Hai, Mimi! Mulai sekarang kita berteman, ya!"},
            {"page": 5, "text": "Arkan merawat Mimi setiap hari. Mereka bermain bersama dan selalu menjaga kebersihan rumah. Arkan berkata: Yay! Seru sekali bermain bersama Mimi!"},
            {"page": 6, "text": "Arkan belajar bahwa menolong makhluk kecil adalah perbuatan yang baik. Mimi pun tumbuh sehat dan bahagia bersama Arkan. Arkan berkata: Aku senang dapat menolong Mimi. Berbuat baik membuat hati bahagia!"}
        ]
    },
    # Buku 6: Arkan dan Petualangan di Hutan Mini
    {
        "book_id": "buku-6",
        "voice": "id-ID-GadisNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {"page": 1, "text": "Hari Minggu, Arkan dan Mama berkunjung ke Hutan Mini di kota. Arkan sangat senang karena bisa melihat banyak hewan! Arkan berkata: Wah! Lihat itu, Mama! Kelinci! Lucu sekali!"},
            {"page": 2, "text": "Tiba-tiba, Arkan melihat anak burung di bawah pohon. Anak burung itu sepertinya jatuh dari sarangnya. Arkan berkata: Aduh... kamu kenapa sendirian di sini?"},
            {"page": 3, "text": "Arkan tidak tega. Ia memanggil petugas Hutan Mini dan memberi tahu kejadian itu. Arkan berkata: Pak, ada anak burung yang jatuh dari sarangnya."},
            {"page": 4, "text": "Petugas bersama Arkan mengembalikan anak burung itu ke sarangnya yang aman. Pak Petugas berkata: Sekarang kamu aman ya, Nak. Hati-hati ya!"},
            {"page": 5, "text": "Sebagai tanda terima kasih, Mama membelikan es krim favorit Arkan. Arkan senang sekali! Arkan berkata: Terima kasih Mama! Hari ini menyenangkan sekali!"},
            {"page": 6, "text": "Arkan belajar bahwa menolong makhluk kecil adalah perbuatan baik. Ia berjanji akan selalu menjaga dan menyayangi hewan. Arkan berkata: Aku akan selalu menjaga mereka. Semua makhluk hidup berhak bahagia!"}
        ]
    },
    # Buku 5: Arkan Olahraga Pagi Sama Mama
    {
        "book_id": "buku-5",
        "voice": "id-ID-GadisNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {"page": 1, "text": "Pagi-pagi Arkan bangun dengan semangat. Arkan siap olahraga bersama Mama! Arkan berkata: Yay! Hari ini olahraga pagi sama Mama!"},
            {"page": 2, "text": "Mama mengajak Arkan pemanasan terlebih dahulu agar tubuh tidak kaku. Mama berkata: Pemanasan yuk, biar badan kita sehat!"},
            {"page": 3, "text": "Arkan berlari-lari kecil mengelilingi taman. Arkan tertawa riang! Arkan berkata: Whee... asyik sekali!"},
            {"page": 4, "text": "Setelah itu, mereka jalan santai dan bersepeda bersama. Udara pagi terasa segar! Arkan berkata: Seru banget olahraga sama Mama!"},
            {"page": 5, "text": "Setelah olahraga, Arkan minum air putih dan makan buah. Tubuh jadi segar dan berenergi! Arkan berkata: Segar dan berenergi!"},
            {"page": 6, "text": "Arkan senang bisa olahraga pagi bersama Mama. Arkan berjanji akan rajin olahraga setiap hari! Arkan berkata: Olahraga bersama Mama itu menyenangkan! Besok kita olahraga lagi ya!"}
        ]
    },
    # Buku 4: Arkan dan Sepeda Barunya
    {
        "book_id": "buku-4",
        "voice": "id-ID-ArdiNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {"page": 1, "text": "Suatu pagi, Papa memberi Arkan sepeda baru. Arkan sangat senang! Arkan berkata: Wah! Sepeda baru untukku! Terima kasih, Papa!"},
            {"page": 2, "text": "Arkan ingin langsung bisa naik sepeda. Tapi... saat mulai mengayuh, ia oleng dan hampir jatuh. Arkan berkata: Aduh! Oleng!"},
            {"page": 3, "text": "Arkan berlatih terus dengan semangat. Papa selalu mendampinginya dan memberi semangat. Papa berkata: Pelan-pelan ya, Arkan. Kamu pasti bisa!"},
            {"page": 4, "text": "Arkan jatuh lagi. Lututnya sedikit sakit, tapi ia bangkit dan tersenyum. Arkan berkata: Tidak apa-apa. Aku akan coba lagi!"},
            {"page": 5, "text": "Setelah berlatih berkali-kali, akhirnya Arkan bisa mengayuh dengan seimbang! Arkan berkata: Yay! Aku bisa naik sepeda!"},
            {"page": 6, "text": "Arkan belajar bahwa dengan latihan, kesabaran, dan tidak mudah menyerah, kita bisa mencapai apa yang kita inginkan. Arkan berkata: Aku bangga pada diriku! Aku tidak menyerah!"}
        ]
    },
    # Buku 3: Arkan dan Toples Kebaikan
    {
        "book_id": "buku-3",
        "voice": "id-ID-ArdiNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {"page": 1, "text": "Arkan memiliki sebuah toples kecil. Setiap kali Arkan melakukan kebaikan, Arkan memasukkan satu kancing ke dalamnya. Arkan berkata: Kebaikan sekecil apa pun, sangat berarti!"},
            {"page": 2, "text": "Pagi itu, Arkan membantu Mama merapikan mainan tanpa diminta. Arkan memasukkan satu kancing ke dalam toplesnya. Mama berkata: Terima kasih ya, Arkan. Mama senang sekali!"},
            {"page": 3, "text": "Di sekolah, Arkan melihat temannya sedih karena pensilnya jatuh dan patah. Arkan meminjamkan pensilnya. Arkan memasukkan satu kancing lagi. Temannya berkata: Terima kasih, Arkan. Kamu baik sekali!"},
            {"page": 4, "text": "Sore hari, Arkan membantu nenek menyiram tanaman. Arkan memasukkan satu kancing lagi. Nenek berkata: Wah, cucu nenek hebat sekali!"},
            {"page": 5, "text": "Malamnya, Arkan melihat toplesnya sudah hampir penuh! Arkan merasa senang dan bangga. Arkan berkata: Alhamdulillah, hari ini banyak kebaikan yang bisa aku lakukan!"},
            {"page": 6, "text": "Arkan tahu, melakukan kebaikan membuat hati bahagia dan banyak orang tersenyum. Arkan berjanji akan terus berbuat baik setiap hari. Arkan berkata: Ayo, teman-teman! Kita lakukan kebaikan setiap hari, agar dunia menjadi lebih indah!"}
        ]
    },
    # Buku 2: Arkan dan Anak Burung Kecil
    {
        "book_id": "buku-2",
        "voice": "id-ID-GadisNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {"page": 1, "text": "Pagi itu, Arkan sedang bermain di halaman rumah. Tiba-tiba, Arkan mendengar suara cip... cip... cip... Arkan berkata: Wah, ada anak burung! Kenapa sendirian, ya?"},
            {"page": 2, "text": "Arkan melihat sekeliling. Mungkin induknya sedang mencari makanan. Arkan tidak memindahkan anak burung itu agar induknya bisa menemukannya. Arkan berkata: Tenang ya, aku di sini jagain kamu."},
            {"page": 3, "text": "Arkan membuatkan tempat yang nyaman untuk anak burung itu. Arkan mengambil daun kering yang lembut dan menaruhnya di dalam kardus kecil. Arkan berkata: Ini rumah kecilmu ya. Semoga kamu nyaman."},
            {"page": 4, "text": "Arkan menunggu dengan sabar sampai siang hari. Ia tidak pergi jauh dari tempat itu. Arkan berkata: Aku tunggu di sini ya..."},
            {"page": 5, "text": "Akhirnya, induk burung kembali! Ia turun dan memberi makan anaknya. Arkan senang melihatnya. Arkan berkata: Syukurlah, induknya sudah kembali!"},
            {"page": 6, "text": "Arkan melambaikan tangan pelan-pelan. Ia senang bisa menolong anak burung kecil. Arkan belajar bahwa menolong dengan hati yang baik itu membuat kita bahagia. Arkan berkata: Sampai jumpa ya, teman kecil! Jaga dirimu baik-baik."}
        ]
    },
    # Buku 1: Arkan si Anak Baik Hati
    {
        "book_id": "buku-1",
        "voice": "id-ID-ArdiNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {"page": 1, "text": "Ini Arkan. Arkan adalah anak yang baik hati dan suka menolong. Arkan berkata: Halo teman-teman! Namaku Arkan!"},
            {"page": 2, "text": "Suatu hari, Arkan melihat temannya, Bima, menjatuhkan bukunya. Bima berkata: Oh tidak, buku-bukuku terjatuh!"},
            {"page": 3, "text": "Arkan segera membantu Bima mengambilkan buku-bukunya dengan senyum. Arkan berkata: Mari kubantu ambilkan bukumu, Bima!"},
            {"page": 4, "text": "Bima berkata, 'Terima kasih ya, Arkan! Kamu baik sekali!' Arkan hanya tersenyum."},
            {"page": 5, "text": "Ibu guru melihat itu dan memuji Arkan di depan teman-teman. Ibu Guru berkata: Arkan anak yang baik hati. Kalian semua hebat!"},
            {"page": 6, "text": "Arkan belajar, menjadi anak baik hati membuat banyak teman senang dan Allah juga senang. Arkan dan Ibu Guru berkata: Menolong teman membuat hati tenang dan bahagia!"}
        ]
    },
    # Buku 11: Petualangan Arkan di Hutan Huruf
    {
        "book_id": "buku-11",
        "voice": "id-ID-ArdiNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {"page": 1, "text": "Tigo si naga berdiri di samping tempat tidur Arkan dengan headphone favoritnya, mengajak berpetualang. Arkan tersenyum setuju, dan Kiko si kucing meong gembira! Tigo berkata: Ayo Arkan, hari ini kita petualangan lagi ke Hutan Huruf dan Pulau Hewan!"},
            {"page": 2, "text": "Arkan memakai setelan selam dan Tigo menyelam ke dasar laut untuk menyelamatkan ikan badut yang terjebak di jaring. Arkan dengan sigap menekan tombol A di panel kontrol! Panel kontrol berkata: Tolong Arkan selamatkan ikan dari jaring!"},
            {"page": 3, "text": "Tigo mengumumkan kedatangan mereka! Mereka mendarat dengan balon udara di Hutan Huruf, di mana pohon-pohon berbentuk huruf raksasa. Hewan-hewan hutan menyambut sambil memegang blok angka. Tigo berkata: Hutan Huruf dan Pulau Hewan menanti kita!"},
            {"page": 4, "text": "Arkan dan orang tuanya berbalapan sepeda di jalur outdoor yang cerah dan rindang. Arkan mengayuh kencang sambil berteriak gembira menuju garis finish! Arkan berkata: Hampir sampai!"},
            {"page": 5, "text": "Tigo menunjuk panel kontrol ajaib. Mereka menyelesaikan puzzle bentuk logika di depan gerbang Kastil Ilmu untuk membuka pintu gerbang raksasa! Tigo berkata: Arkan, kita perlu menghubungkan segitiga kuning!"},
            {"page": 6, "text": "Arkan dan teman-temannya kembali di kamar, merayakan kemenangan. Arkan memegang trofi piala emas besar dengan mahkota berkilauan! Pengumuman berkata: Hebat Arkan! Level 13 dan Piala Emas Dimenangkan!"},
            {"page": 7, "text": "Keluarga berkumpul di tempat tidur Arkan. Ayah membacakan buku cerita tentang Kastil Ilmu. Arkan merenung bahagia: Logika dan memoriku sudah 90 persen, besok kita akan mencoba Kastil Ilmu! Ayah dan Arkan berkata: Selamat malam, Arkan. Besok ada petualangan baru!"}
        ]
    },
    # Buku 10: Misteri Samudra & Terumbu Karang
    {
        "book_id": "buku-10",
        "voice": "id-ID-ArdiNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {"page": 1, "text": "Arkan memakai kacamata selam dan tabung oksigen super. Bersama Tigo, mereka meluncur melintasi kawanan ikan warna-warni di terumbu karang. Tigo berkata: Perhatikan radar, Arkan! Ada gelombang sinyal ikan badut!"},
            {"page": 2, "text": "Jaring terperangkap di antara karang raksasa. Dengan ketangkasan tangan, Arkan mengarahkan robot pencapit dan menekan tombol A tepat pada waktunya! Arkan berkata: Tekan tombol A sekarang!"},
            {"page": 3, "text": "Ikan badut melompat gembira dan kawanan lumba-lumba menari membentuk lingkaran air terjun di sekeliling Arkan dan Tigo. Misi samudra sukses besar! Lumba-lumba berkata: Terima kasih Arkan! Kamu pahlawan samudra kami!"}
        ]
    },
    # Buku 9: Balapan Sepeda & Semangat Juara
    {
        "book_id": "buku-9",
        "voice": "id-ID-GadisNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {"page": 1, "text": "Roda sepeda Arkan berputar cepat di lintasan taman yang rindang. Burung-burung berkicau memberi semangat saat Arkan memimpin di garis depan! Ayah dan Ibu berkata: Siap... satu, dua, tiga... kayuh sepedamu, Arkan!"},
            {"page": 2, "text": "Meskipun jalanan menanjak, Arkan tidak menyerah sedikit pun. Dengan stamina penuh, sepeda meluncur mulus melintasi tanjakan! Arkan berkata: Aku pasti bisa sampai di puncak tanjakan!"},
            {"page": 3, "text": "Arkan melintasi garis finish pita merah dengan senyuman lebar. Seluruh keluarga bertepuk tangan bangga atas semangat olahraga Arkan! Seluruh keluarga berkata: Hooray Arkan! Juara Satu Sehat Bersama!"}
        ]
    },
    # Buku 8: Kastil Logika & Mahkota Emas
    {
        "book_id": "buku-8",
        "voice": "id-ID-ArdiNeural",
        "rate": "-12%",
        "pitch": "-2Hz",
        "pages": [
            {"page": 1, "text": "Di depan pintu gerbang batu raksasa, ada kristal berbentuk geometri bercahaya. Arkan menganalisis pola bentuk warna dengan teliti! Ksatria Teka-Teki berkata: Cocokkan pola logika segitiga untuk membuka gerbang!"},
            {"page": 2, "text": "Pintu gerbang terbuka dengan efek sihir gemerlap. Di tengah ruangan berkilau trofi emas murni berpuncak mahkota megah! Peti Ajaib berkata: Selamat! Kamu adalah Pangeran Logika Cerdas!"},
            {"page": 3, "text": "Arkan memajang piala emas barunya di rak kamar. Ruangan berbinar hangat menandai keberhasilan petualangan hari ini! Arkan berkata: Rak pialaku semakin penuh dan keren!"}
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
            
            print(f"Generating voice for {book_id} page {page_num}: {filename}...")
            communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            await communicate.save(filepath)
            print(f"Saved: {filepath}")

if __name__ == "__main__":
    asyncio.run(generate_all())
