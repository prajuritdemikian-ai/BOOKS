# Flowork: Visual AI Workflow Automation Platform

<p align="center">
  <a href="https://flowork.cloud"><img src="https://img.shields.io/badge/Website-flowork.cloud-blue?style=for-the-badge" alt="Website"></a>
  <a href="https://docs.flowork.cloud/"><img src="https://img.shields.io/badge/Docs-Read_Here-green?style=for-the-badge" alt="Documentation"></a>
  <a href="https://discord.gg/Gv7h5d5d"><img src="https://img.shields.io/badge/Discord-Join_Chat-7289DA?style=for-the-badge&logo=discord" alt="Discord"></a>
  <a href="https://t.me/FLOWORK_AUTOMATION"><img src="https://img.shields.io/badge/Telegram-Join_Channel-2CA5E0?style=for-the-badge&logo=telegram" alt="Telegram"></a>
  <a href="https://www.youtube.com/playlist?list=PLATUnnrT5igDXCqjBVvkmE4UKq9XASUtT"><img src="https://img.shields.io/badge/YouTube-Watch_Tutorials-red?style=for-the-badge&logo=youtube" alt="YouTube"></a>
  </p>

<p align="center">
  <img src="https://flowork.cloud/images/flowork_2.webp" alt="Flowork Synapse Logo" width="600"/>
</p>

> Flowork adalah *engine* orkestrasi *workflow* AI *open-core* dan *self-hosted* yang dirancang untuk **Skalabilitas Terdistribusi Global** dan **Kedaulatan Data Pengguna Penuh**.

[cite_start]Arsitektur kami memisahkan antarmuka (GUI di *cloud*) dari logika inti (*Gateway* dan *Core* di server Anda), memberi Anda kendali penuh atas data dan sumber daya Anda. [cite_start]Prinsip inti kami: **"Data Anda di Server Anda."** 

---

## 🚀 Instalasi Cepat (Docker)

Panduan ini menggunakan Docker Compose untuk penyiapan lokal.

### Prasyarat
* Docker Desktop (atau Docker Engine)
* [cite_start]Python 3.11+ (untuk menjalankan skrip pengaturan) 

### Langkah-langkah Instalasi
1.  **Buat Environment:** Hasilkan ID Engine, Token, dan *Admin Login Private Key* baru.
    ```bash
    python generate_env.py
    ```

2.  **Build dan Jalankan Kontainer:** Bangun kontainer **Gateway** (yang mencakup Core Kernel, migrasi database, dan semua dependensi AI/ML).
    ```bash
    # PENTING: Gunakan --force-recreate --no-cache untuk proses pertama kali.
    docker-compose up --build --force-recreate -d
    
    # Untuk restart selanjutnya:
    docker-compose up -d
    ```

3.  **Dapatkan Private Key (Login):** Periksa *log* Gateway untuk mengambil *private key* admin yang baru dibuat.
    ```bash
    docker-compose logs flowork_gateway
    # Cari: !!! YOUR LOGIN PRIVATE KEY IS: ...
    ```

### Konfigurasi Cloudflare Tunnel (Wajib untuk Akses GUI)
GUI Flowork mengakses API Anda melalui *tunnel*.

1.  **Dapatkan Token:** Dapatkan **Cloudflare Tunnel Token** Anda dari *dashboard* Cloudflare.
2.  [cite_start]**Atur di .env:** Pastikan `CLOUDFLARED_TUNNEL_TOKEN` di *file* `.env` Anda sudah diatur.
3.  [cite_start]**Restart Kontainer:** *Restart* kontainer `flowork_cloudflared` (atau seluruh *stack*) agar *tunnel* terhubung ke layanan Gateway (`http://flowork_gateway:8000`).

---

## ✨ Fitur Utama

### 1. Filosofi Inti: Privasi & Kedaulatan Data
* [cite_start]**Kedaulatan Data Pengguna:** Semua database (SQLite/PostgreSQL) dan data pribadi pengguna berada secara eksklusif di server Anda (*self-hosted*).
* [cite_start]**Akses Kripto (Zero-Trust):** Kami menggunakan Teknologi Kripto Web3 (*Private Key*) untuk otentikasi admin dan pengguna, menyediakan lapisan keamanan *zero-trust* yang kuat.
* [cite_start]**Jejak Audit (Audit Trail):** Semua aktivitas administratif dicatat di *Audit Log* lokal di server pengguna.

### 2. Keunggulan Arsitektur & Kinerja
* [cite_start]**Model Eksekusi Terpisah:** Core Kernel kami berjalan dalam proses/kontainer terpisah dari Gateway, memastikan stabilitas tertinggi untuk penerapan terdistribusi.
* **Agnostik Penyedia AI:** Tidak terkunci pada satu penyedia AI. [cite_start]Pengguna bebas memilih antara AI *cloud* (Gemini, ChatGPT) atau model **AI Lokal** (*on-premise*).
* [cite_start]**Efisien Sumber Daya:** Menggunakan **SQLite** sebagai *database default* berbasis *file* untuk **zero-setup** dan efisiensi sumber daya (RAM/CPU).

### 3. Mesin Runner Multi-Bahasa
* [cite_start]**Eksekusi Poliglot:** Jalankan modul kode yang ditulis dalam **Python, JavaScript, Bash, PHP, Perl, dan Ruby** langsung di dalam *workflow* visual Anda.

### 4. Pemicu & Otomatisasi OS-Native
* [cite_start]**Pengamat Sistem File (File Watchers):** Picu *workflow* secara instan saat ada perubahan (pembuatan, modifikasi, penghapusan) di direktori atau *file* lokal.
* [cite_start]**Pemantauan Proses & Cron:** Mulai tugas berdasarkan jadwal Cron atau status proses lokal lainnya yang sedang berjalan.

### 5. AI Powerhouse & Perangkat Developer
* **Pelatihan AI Terintegrasi:** Mendukung *workflow* untuk **Pelatihan Model AI** yang dilakukan sepenuhnya di dalam lingkungan server Anda.
* [cite_start]**Dukungan AI Lokal:** Mendukung model AI *on-premise* yang berjalan di perangkat keras Anda (misalnya, ditenagai oleh **llama-cpp-python**).
* [cite_start]**Debugger "Time Traveler":** Memungkinkan Anda memeriksa *state* data (*variabel* dan *payload*) **setelah setiap *node*** dieksekusi.
* [cite_start]**Mode "Quick Run":** Memungkinkan *developer* mengeksekusi **satu *modul* secara independen** untuk pengujian dan *debugging* cepat.

### 6. Kolaborasi & Berbagi Sumber Daya
* [cite_start]**Berbagi Engine:** Pengguna dapat **berbagi akses ke Engine** (server) mereka dengan pengguna Flowork lain di bawah kontrol izin yang ketat.
* **Berbagi Preset:** Bagikan *workflow* atau *preset* yang telah Anda buat dengan mudah.

## 🌐 Sumber Daya & Komunitas

Bergabunglah dengan komunitas kami! Kami berkembang pesat dan menyambut kontribusi serta umpan balik Anda.

| Platform | Tautan |
| :--- | :--- |
| **Website** | [cite_start][https://flowork.cloud](https://flowork.cloud)  |
| **Repo GitHub** | [cite_start][https://github.com/flowork-dev/Visual-AI-Workflow-Automation-Platform.git](https://github.com/flowork-dev/Visual-AI-Workflow-Automation-Platform.git)  |
| **Dokumentasi (Docs)** | [cite_start][https://docs.flowork.cloud/](https://docs.flowork.cloud/)  |
| **Server Discord** | [cite_start][https://discord.gg/Gv7h5d5d](https://discord.gg/Gv7h5d5d)  |
| **Channel Telegram** | [cite_start][https://t.me/FLOWORK_AUTOMATION](https://t.me/FLOWORK_AUTOMATION)  |
| **Playlist YouTube** | [cite_start][https://www.youtube.com/playlist?list=PLATUnnrT5igDXCqjBVvkmE4UKq9XASUtT](https://www.youtube.com/playlist?list=PLATUnnrT5igDXCqjBVvkmE4UKq9XASUtT)  |