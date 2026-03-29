// Format Helper
const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    return timeStr.split(':').slice(0, 2).join(':');
};

const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
};

// Jam Digital Real-time
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
    const dateString = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    document.getElementById('clock-time').textContent = timeString;
    document.getElementById('clock-date').textContent = dateString;
    return timeString; // Return for last update timestamp
}

// Variabel untuk Auto-scroll
let autoScrollInterval;
let scrollTimeout;

// Fungsi Auto-scroll
function startAutoScroll() {
    const grid = document.getElementById('reservations-grid');

    // Bersihkan interval sebelumnya jika ada
    if (autoScrollInterval) clearInterval(autoScrollInterval);
    if (scrollTimeout) clearTimeout(scrollTimeout);

    // Beri jeda sebentar agar transisi masuk (fade-in) elemen selesai
    scrollTimeout = setTimeout(() => {
        // Jika konten tidak melebihi container layar, tidak perlu auto-scroll
        if (grid.scrollHeight <= grid.clientHeight) return;

        autoScrollInterval = setInterval(() => {
            grid.scrollTop += 1; // Kecepatan scroll ke bawah (px)

            // Cek apakah sudah mencapai bagian paling bawah konten
            if (Math.ceil(grid.scrollTop + grid.clientHeight) >= grid.scrollHeight) {
                clearInterval(autoScrollInterval); // Hentikan scroll

                // Beri jeda 5 detik di bagian paling bawah
                scrollTimeout = setTimeout(() => {
                    grid.scrollTo({ top: 0, behavior: 'smooth' }); // Gulir kembali ke atas secara halus

                    // Tunggu 3 detik di posisi atas, lalu mulai auto-scroll kembali
                    scrollTimeout = setTimeout(startAutoScroll, 3000);
                }, 5000);
            }
        }, 30); // Dieksekusi setiap 30 milidetik agar scroll terlihat halus
    }, 5000); // Tunggu 5 detik di awal sebelum mulai jalan
}

// Render Data ke HTML
function renderReservations(data) {
    const grid = document.getElementById('reservations-grid');
    const loading = document.getElementById('loading-indicator');

    // Hentikan scroll saat me-render ulang
    if (autoScrollInterval) clearInterval(autoScrollInterval);
    if (scrollTimeout) clearTimeout(scrollTimeout);
    grid.scrollTo({ top: 0 });

    // Filter hanya status active
    const activeData = data.filter(item => item.status && item.status.toLowerCase() === 'active');

    loading.classList.add('hidden');
    grid.classList.remove('hidden');

    if (activeData.length === 0) {
        grid.innerHTML = `
                    <div class="col-span-full flex justify-center items-center h-full min-h-[400px]">
                        <p class="text-4xl text-slate-500">Tidak ada jadwal reservasi aktif saat ini.</p>
                    </div>
                `;
    } else {
        let htmlContent = '';
        activeData.forEach((item, index) => {
            // Batasi delay animasi masuk maksimal 1 detik agar tidak terlalu lama untuk item ke-sekian
            const delay = Math.min(index * 0.15, 1);
            const waktuSelesai = item.jam_selesai === "00:00:00" ? "Selesai" : formatTime(item.jam_selesai);
            const keterangan = item.keterangan ? item.keterangan : '-';

            htmlContent += `
                    <div 
                        class="animate-fade-in-up bg-slate-800/50 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col justify-between hover:bg-slate-800/80 hover:border-emerald-500/40 transition-all duration-300"
                        style="animation-delay: ${delay}s"
                    >
                        <div>
                            <!-- Card Header: Room & Status -->
                            <div class="flex justify-between items-start mb-6">
                                <div class="inline-flex items-center gap-3 bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 px-5 py-2.5 rounded-full text-2xl font-semibold shadow-inner">
                                    <i data-lucide="map-pin" class="w-7 h-7 text-emerald-400"></i>
                                    ${item.ruangan}
                                </div>
                                <div class="flex items-center gap-3 bg-blue-900/40 text-blue-300 border border-blue-500/30 px-5 py-2.5 rounded-full text-xl font-medium tracking-wide">
                                    <span class="relative flex h-4 w-4">
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                                    </span>
                                    ${item.status.toUpperCase()}
                                </div>
                            </div>

                            <!-- Event Title -->
                            <h2 class="text-4xl font-bold text-white mb-8 leading-snug line-clamp-2">
                                ${item.nama_pertemuan}
                            </h2>

                            <!-- Details Grid -->
                            <div class="grid grid-cols-2 gap-y-6 gap-x-8 text-2xl">
                                <!-- Date & Time -->
                                <div class="col-span-2 bg-slate-900/60 rounded-2xl p-5 border border-white/5 flex items-center gap-5 shadow-inner">
                                    <div class="bg-orange-500/20 p-3 rounded-xl text-orange-400">
                                        <i data-lucide="clock" class="w-10 h-10"></i>
                                    </div>
                                    <div>
                                        <div class="text-slate-400 text-xl mb-1">Waktu Pelaksanaan</div>
                                        <div class="text-white font-semibold">
                                            ${formatDate(item.tanggal)} <br/>
                                            <span class="text-orange-400 text-3xl font-bold inline-block mt-2 drop-shadow-sm">
                                                ${formatTime(item.jam_mulai)} - ${waktuSelesai} WIB
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- PIC -->
                                <div class="flex items-start gap-4">
                                    <i data-lucide="user" class="w-8 h-8 text-blue-400 shrink-0 mt-1"></i>
                                    <div>
                                        <div class="text-slate-400 text-lg">Penanggung Jawab</div>
                                        <div class="text-white font-medium">${item.pj}</div>
                                        <div class="text-blue-300 text-lg mt-1">${item.bidang}</div>
                                    </div>
                                </div>

                                <!-- Keterangan -->
                                <div class="flex items-start gap-4">
                                    <i data-lucide="info" class="w-8 h-8 text-emerald-400 shrink-0 mt-1"></i>
                                    <div>
                                        <div class="text-slate-400 text-lg">Keterangan</div>
                                        <div class="text-white font-medium text-xl leading-relaxed">
                                            ${keterangan}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
        });
        grid.innerHTML = htmlContent;

        // Jalankan fungsi auto scroll setelah selesai me-render DOM
        startAutoScroll();
    }

    // Inisialisasi ulang icon lucide
    lucide.createIcons();

    // Set update time di footer
    document.getElementById('last-update').textContent = updateClock();
}

// Fetch Data API
async function fetchReservations() {
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('/reservasi/reservasi');

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();

        if (result.status && result.data) {
            errorAlert.classList.add('hidden');
            renderReservations(result.data);
        } else {
            throw new Error('Format data tidak sesuai');
        }
    } catch (err) {
        console.warn("API gagal diakses, menggunakan data fallback simulasi.", err);

        errorMessage.textContent = "Menggunakan data simulasi (Koneksi API terputus / diblokir CORS)";
        errorAlert.classList.remove('hidden');
    }
}

// Inisialisasi awal saat layar dimuat
window.onload = () => {
    lucide.createIcons();

    updateClock();
    setInterval(updateClock, 1000);

    fetchReservations();

    // Auto refresh mengambil data API setiap 5 Menit (300.000 ms)
    setInterval(fetchReservations, 5 * 60 * 1000);
};