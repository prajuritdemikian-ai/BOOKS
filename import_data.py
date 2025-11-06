# Hardcode: import_data.py
# [MODIFIED] Diubah total buat ngirim SATU PER SATU (sesuai request)
# [MODIFIED] Dihilangin BATCH_SIZE dan BEGIN TRANSACTION

import csv
import subprocess
import sys
import os

# --- KONFIGURASI ---
DB_NAME = "database-buku" # Sesuai wrangler.toml
CSV_FILENAME = "DB.csv" # Nama file CSV
# --------------------

def format_value(value):
    """Helper function to format CSV value for SQL INSERT."""
    if not value:
        return "NULL"
    cleaned_value = value.replace("'", "''")
    return f"'{cleaned_value}'"

def execute_wrangler_row(sql_statement, row_number):
    """
    [MODIFIED] Fungsi ini sekarang eksekusi SATU statement SQL, bukan batch.
    """
    print(f"[INFO] Mengirim baris #{row_number} ke D1 (DB: {DB_NAME})...")

    # [MODIFIED] Gak ada lagi BEGIN TRANSACTION
    command = ["wrangler", "d1", "execute", DB_NAME, "--command", sql_statement, "--remote"]

    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True, shell=True, encoding='utf-8')
        print(f"[SUCCESS] Baris #{row_number} berhasil di-import.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Gagal eksekusi baris #{row_number}!")
        print(f"Pesan Error: {e.stderr}")
        print("--- Melanjutkan ke baris berikutnya ---")
        return False

def main():
    print("========================================")
    print("  Flowork D1 CSV Importer v1.5 (Python) ") # Versi baru
    print("========================================")

    if not os.path.exists("wrangler.toml"):
        print("[ERROR] File 'wrangler.toml' tidak ditemukan!")
        sys.exit(1)

    if not os.path.exists(CSV_FILENAME):
        print(f"[ERROR] File tidak ditemukan: {CSV_FILENAME}")
        sys.exit(1)

    total_processed = 0
    total_success = 0

    try:
        with open(CSV_FILENAME, mode='r', encoding='utf-8-sig') as f:
            sniffer = csv.Sniffer()
            dialect = sniffer.sniff(f.read(1024))
            f.seek(0)
            reader = csv.DictReader(f, dialect=dialect)

            print(f"[INFO] Membaca file '{CSV_FILENAME}' (delimiter='{dialect.delimiter}')...")

            for row in reader:
                total_processed += 1

                if not row.get('Judul') or not row.get('KodeUnik') or not row.get('tangal'):
                    print(f"[WARNING] Skipping baris {total_processed}: 'Judul', 'KodeUnik', atau 'tangal' kosong.")
                    continue

                # Bikin SQL INSERT
                sql = (
                    f"INSERT INTO Buku (Judul, Deskripsi, Author, Image, Kategori, KodeUnik, tangal, pv) "
                    f"VALUES ("
                    f"{format_value(row.get('Judul'))}, "
                    f"{format_value(row.get('Deskripsi'))}, "
                    f"{format_value(row.get('Author'))}, "
                    f"{format_value(row.get('Image'))}, "
                    f"{format_value(row.get('Kategori'))}, "
                    f"{format_value(row.get('KodeUnik'))}, "
                    f"{format_value(row.get('tangal'))}, "
                    f"0" # Default PV
                    f");"
                )

                # [MODIFIED] Langsung eksekusi satu per satu
                if execute_wrangler_row(sql, total_processed):
                    total_success += 1

    except Exception as e:
        print(f"[ERROR] Gagal membaca CSV: {e}")
        sys.exit(1)

    print("----------------------------------------")
    print(f"[DONE] Selesai. Total baris diproses: {total_processed}. Berhasil di-import: {total_success}")
    print("----------------------------------------")

if __name__ == "__main__":
    main()