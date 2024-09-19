document.addEventListener("DOMContentLoaded", function () {
  let stokBarang = {}; // Objek untuk menyimpan stok barang dengan harga per unit

  // Event listener untuk form
  document
    .getElementById("form-barang")
    .addEventListener("submit", function (e) {
      e.preventDefault(); // Mencegah form dari reload halaman

      // Ambil data dari form
      const nama = document.getElementById("nama").value.trim();
      const jumlah = parseInt(document.getElementById("jumlah").value); // Pastikan jumlah berupa angka
      const harga = parseInt(document.getElementById("harga").value); // Harga per barang
      const tanggal = document.getElementById("tanggal").value;
      const tipe = document.getElementById("tipe").value; // Pastikan tipe diambil dengan benar
      const totalNilai = jumlah * harga; // Hitung total nilai barang

      // Cek jika data valid
      if (nama && jumlah > 0 && harga > 0) {
        // Format harga dan total nilai
        const hargaFormatted = formatCurrency(harga);
        const totalNilaiFormatted = formatCurrency(totalNilai);

        // Update data stok barang
        if (!stokBarang[nama]) {
          stokBarang[nama] = { jumlah: 0, harga: harga }; // Jika barang belum ada, tambahkan dengan stok awal 0
        }

        // Tambah atau kurangi stok berdasarkan tipe (masuk/keluar)
        if (tipe === "masuk") {
          stokBarang[nama].jumlah += jumlah;
          // Simpan harga per unit hanya saat barang pertama kali dimasukkan
          stokBarang[nama].harga = harga;
          tambahDataBarang(
            "masuk",
            nama,
            jumlah,
            hargaFormatted,
            totalNilaiFormatted,
            tanggal
          );
        } else if (tipe === "keluar") {
          stokBarang[nama].jumlah -= jumlah;
          if (stokBarang[nama].jumlah < 0) stokBarang[nama].jumlah = 0; // Pastikan stok tidak negatif
          tambahDataBarang(
            "keluar",
            nama,
            jumlah,
            hargaFormatted,
            totalNilaiFormatted,
            tanggal
          );
        }

        // Reset form setelah submit
        this.reset();
      } else {
        alert("Mohon isi data dengan benar.");
      }
    });

  function formatCurrency(amount) {
    // Format angka menjadi format mata uang dengan simbol " ,- " di akhir
    return (
      amount
        .toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        })
        .replace("IDR", "")
        .trim() + ",-"
    );
  }

  function tambahDataBarang(
    tipe,
    nama,
    jumlah,
    hargaFormatted,
    totalNilaiFormatted,
    tanggal
  ) {
    let tbody;
    if (tipe === "masuk") {
      tbody = document.querySelector("#data-barang-masuk tbody");
    } else if (tipe === "keluar") {
      tbody = document.querySelector("#data-barang-keluar tbody");
    }

    // Tambahkan data ke tabel barang masuk atau keluar
    const row = tbody.insertRow();
    row.innerHTML = `
            <td>${nama}</td>
            <td>${jumlah}</td>
            <td>${hargaFormatted}</td>
            <td>${totalNilaiFormatted}</td>
            <td>${tanggal}</td>
            <td><button onclick="hapusBaris(this, '${tipe}', '${nama}', ${jumlah})">Hapus</button></td>
        `;
  }

  window.hapusBaris = function (button, tipe, nama, jumlah) {
    // Tampilkan konfirmasi penghapusan
    const konfirmasi = window.confirm(
      `Apakah Anda yakin ingin menghapus ${nama} (${jumlah} unit) dari daftar ${tipe}?`
    );

    if (konfirmasi) {
      const row = button.parentNode.parentNode; // Mendapatkan baris yang berisi tombol hapus
      row.parentNode.removeChild(row); // Menghapus baris dari tabel

      // Update stok barang berdasarkan tipe (masuk/keluar)
      if (tipe === "masuk") {
        stokBarang[nama].jumlah -= jumlah;
        if (stokBarang[nama].jumlah < 0) stokBarang[nama].jumlah = 0; // Pastikan stok tidak negatif
      } else if (tipe === "keluar") {
        stokBarang[nama].jumlah += jumlah;
      }

      // Jika jumlah stok barang adalah 0, hapus barang dari stok
      if (stokBarang[nama].jumlah === 0) {
        delete stokBarang[nama];
      }
    }
  };

  function downloadPDF(tableId, filename) {
    const element = document.getElementById(tableId);

    const opt = {
      margin: 1,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().from(element).set(opt).save();
  }

  // Menambahkan event listener untuk tombol unduh PDF
  document
    .querySelector("button[onclick*='data-barang-masuk']")
    .addEventListener("click", function () {
      downloadPDF("data-barang-masuk", "Barang_Masuk.pdf");
    });

  document
    .querySelector("button[onclick*='data-barang-keluar']")
    .addEventListener("click", function () {
      downloadPDF("data-barang-keluar", "Barang_Keluar.pdf");
    });
});
