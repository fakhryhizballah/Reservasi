

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('postReservasi').addEventListener('submit', function (event) {
        event.preventDefault(); // Mencegah form untuk melakukan submit pada halaman baru
        // console.log(document.getElementById('nama_pertemuan').value);
        let data = {
            nama_pertemuan: document.getElementById('nama_pertemuan').value,
            pj: document.getElementById('pj').value,
            wa_pj: document.getElementById('wa_pj').value,
            bidang: document.getElementById('bidang').value,
            tanggal: document.getElementById('tanggal').value,
            jam_mulai: document.getElementById('jam_mulai').value,
            jam_selesai: document.getElementById('jam_selesai').value,
            ruangan: document.getElementById('ruangan').value,
            keterangan: document.getElementById('keterangan').value
        };

        fetch('/reservasi/reservasi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(response => {
                if (response.status == false) {
                    Swal.fire({
                        icon: 'warning',
                        title: response.message,
                        text: response.data,
                        showConfirmButton: false,
                        timer: 2000
                    });
                    return;
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Succeed',
                    text: 'Kegiatan berhasil disimpan',
                    showConfirmButton: false,
                    timer: 2000
                });
                document.querySelectorAll('input, textarea, select').forEach(function (el) {
                    el.value = '';
                });
                getReservasi();
            })
            .catch(error => {
                console.log(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Kegiatan gagal disimpan',
                    showConfirmButton: false,
                    timer: 2000
                });
            });
    });
});


getReservasi();
async function getReservasi() {
    fetch('/reservasi/reservasi')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#listReservasi tbody');
            tbody.innerHTML = ''; // Clear existing table rows

            data.data.forEach(reservasi => {
                const row = document.createElement('tr');

                const namaCell = document.createElement('td');
                namaCell.textContent = reservasi.nama_pertemuan;
                row.appendChild(namaCell);

                const emailCell = document.createElement('td');
                emailCell.textContent = reservasi.pj; // Assuming 'pj' is used for email
                row.appendChild(emailCell);

                const tanggalCell = document.createElement('td');
                tanggalCell.textContent = reservasi.tanggal;
                row.appendChild(tanggalCell);

                const waktuCell = document.createElement('td');
                waktuCell.textContent = `${reservasi.jam_mulai} - ${reservasi.jam_selesai}`;
                row.appendChild(waktuCell);

                const ruanganCell = document.createElement('td');
                ruanganCell.textContent = reservasi.ruangan;
                row.appendChild(ruanganCell);
                const keteranganCell = document.createElement('td');
                keteranganCell.textContent = reservasi.keterangan;
                row.appendChild(keteranganCell);

                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching reservation list:', error);
        });

}

function getCookieStatus(params) {
    const cookieStatus = document.cookie.split(';')
        .find(c => c.trim().startsWith(params + '='));
    return cookieStatus ? cookieStatus.split('=')[1] : null;
}

console.log(getCookieStatus('status'))

if (getCookieStatus('status') != null) {
    let status = getCookieStatus('status')
    console.log(decodeURIComponent(status))
    // Swal.fire({
    //     icon: 'success',
    //     title: 'Succeed',
    //     text: decodeURIComponent(status),
    //     showConfirmButton: false,
    //     timer: 3000
    // });
    Swal.fire({
        title: "Kamu Yakin mau membatalkan reservasi?",
        text: "Anda tidak dapat mengembalikannya!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/reservasi/cancel/' + encodeURIComponent(status), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        Swal.fire({
                            title: "Deleted!",
                            text: "Reservasi Anda telah dibatalkan.",
                            icon: "success"
                        });
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted',
                            text: 'Reservasi Anda telah dibatalkan.',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    }
                })
                .catch(error => {
                    console.error('Error canceling reservation:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Reservasi telah dibatalkan',
        showConfirmButton: false,
                        timer: 2000
                    });
                });

        }
    });
    document.cookie = "status=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";


}