// --- KONFIGURASI UTAMA ---
const API_URL = 'https://kainraja.spairum.my.id/skr/kamar/inap';

// Timer
const REFRESH_INTERVAL = 3 * 60 * 1000; // 5 Menit (Refresh Data API)

// State
let allRoomsData = [];
let progressInterval;
let timeRemaining = REFRESH_INTERVAL;

// State Auto-Scroll
let autoScrollTimer;
let isScrollPaused = false;

// --- DATA FALLBACK (Ditambah data dummy agar efek scroll terlihat jelas) ---
const fallbackData = {
    "status": true,
    "data": [
        { "kd_bangsal": "DD", "bangsal": "Bangsal Dummy", "isi": 10, "kosong": 4, "booking": 0, "total": 14 }
    ]
};

// --- FUNGSI WAKTU & TANGGAL ---
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
    const dateString = now.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });

    document.getElementById('live-time').innerText = timeString;
    document.getElementById('live-date').innerText = dateString;
    document.getElementById('current-year').innerText = now.getFullYear();
}
setInterval(updateClock, 1000);
updateClock();

// --- FUNGSI FETCH API ---
async function fetchRoomData() {
    const grid = document.getElementById('room-grid');
    const loader = document.getElementById('loading-indicator');

    // Hentikan scroll & sembunyikan grid saat fetch ulang
    clearInterval(autoScrollTimer);
    grid.style.opacity = '0';
    loader.classList.remove('hidden');
    loader.style.opacity = '1';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const responseData = await response.json();
        if (responseData.status && responseData.data) {
            allRoomsData = responseData.data;
        } else {
            throw new Error("Format JSON tidak valid");
        }
    } catch (error) {
        console.warn('Gagal fetch API asli. Menggunakan data Fallback.', error);
        allRoomsData = fallbackData.data;
    } finally {
        // Update waktu terakhir diperbarui
        const now = new Date();
        document.getElementById('last-updated').innerText = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

        // Animasi masuk & render semua kartu
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.classList.add('hidden');
                renderAllCards();
            }, 300);
        }, 500);

        resetApiProgress();
    }
}

// --- FUNGSI RENDER SEMUA KARTU ---
function renderAllCards() {
    const container = document.getElementById('room-grid');
    container.innerHTML = '';

    allRoomsData.forEach((room, index) => {
        const isPenuh = room.kosong === 0;
        // Warna diubah menyesuaikan light mode
        const kosongColorClass = isPenuh ? 'text-hospital-danger' : 'text-hospital-success';
        const cardBorderClass = isPenuh ? 'border-red-300 bg-red-50/30' : 'border-hospital-border bg-hospital-card';
        const pulseClass = isPenuh ? 'animate-pulse' : '';

        // Batasi delay animasi masuk maksimal hingga 1 detik (agar rendering tidak terlalu lama jika data sangat banyak)
        const animationDelay = Math.min(index * 40, 1000);

        const cardHTML = `
                    <div class="${cardBorderClass} rounded-2xl p-5 shadow-sm border flex flex-col justify-between transform transition duration-300 hover:shadow-md hover:-translate-y-1 opacity-0 animate-fade-in-up" 
                         style="animation-delay: ${animationDelay}ms;">
                        
                        <!-- Header Card -->
                        <div class="border-b border-slate-100 pb-3 mb-4 flex justify-between items-start">
                            <h2 class="text-lg font-bold text-hospital-text truncate pr-2 w-full" title="${room.bangsal}">
                                ${room.bangsal}
                            </h2>
                        </div>
                        
                        <!-- Angka Utama (Kosong) -->
                        <div class="flex flex-col items-center justify-center mb-5 flex-1">
                            <span class="text-xs text-hospital-muted uppercase tracking-widest mb-1 font-bold">Tersedia</span>
                            <span class="text-6xl font-black ${kosongColorClass} ${pulseClass} leading-none tracking-tighter">
                                ${room.kosong}
                            </span>
                        </div>
                        
                        <!-- Grid Status Bawah -->
                        <div class="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                            <div>
                                <p class="text-[10px] text-slate-500 uppercase font-bold">Terisi</p>
                                <p class="text-lg font-extrabold text-slate-700">${room.isi}</p>
                            </div>
                            <div class="border-x border-slate-200">
                                <p class="text-[10px] text-slate-500 uppercase font-bold">Booking</p>
                                <p class="text-lg font-extrabold text-amber-600">${room.booking}</p>
                            </div>
                            <div>
                                <p class="text-[10px] text-slate-500 uppercase font-bold">Total</p>
                                <p class="text-lg font-extrabold text-hospital-primary">${room.total}</p>
                            </div>
                        </div>
                    </div>
                `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });

    // Tampilkan kembali grid setelah render
    container.style.opacity = '1';

    // Mulai inisiasi auto-scroll setelah animasi kartu selesai (~1.5 detik)
    setTimeout(startAutoScroll, 1500);
}

// --- FUNGSI AUTO-SCROLL ---
function startAutoScroll() {
    clearInterval(autoScrollTimer);
    const scrollContainer = document.getElementById('scroll-container');
    const indicator = document.getElementById('scroll-indicator');

    // Reset posisi ke paling atas
    scrollContainer.scrollTo({ top: 0, behavior: 'auto' });
    isScrollPaused = false;

    // Cek apakah konten cukup panjang untuk di-scroll
    if (scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
        indicator.classList.add('hidden');
        indicator.classList.remove('flex');
        return; // Tidak perlu scroll jika konten muat dalam 1 layar
    }

    // Tampilkan indikator auto-scroll
    indicator.classList.remove('hidden');
    indicator.classList.add('flex');

    // Set interval untuk menggulir otomatis (1px per frame)
    autoScrollTimer = setInterval(() => {
        if (isScrollPaused) return;

        scrollContainer.scrollTop += 1; // Kecepatan scroll

        // Deteksi apakah sudah mencapai bagian paling bawah
        // Menggunakan toleransi -1 karena perhitungan pixel desimal pada beberapa layar
        if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 1) {
            isScrollPaused = true;

            // Jeda sejenak di bagian bawah, lalu kembali ke atas
            setTimeout(() => {
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });

                // Berikan waktu agar smooth scroll selesai sebelum mulai turun lagi
                setTimeout(() => {
                    isScrollPaused = false;
                }, 1500);

            }, 3000); // Jeda 3 detik di bagian terbawah
        }
    }, 30); // Berjalan sekitar ~33 Frame per detik (smooth)
}

// Pause scroll otomatis jika ada interaksi (Hover pakai mouse / Sentuh Layar Kiosk)
const scrollContainer = document.getElementById('scroll-container');
scrollContainer.addEventListener('mouseenter', () => isScrollPaused = true);
scrollContainer.addEventListener('mouseleave', () => isScrollPaused = false);
scrollContainer.addEventListener('touchstart', () => isScrollPaused = true);
scrollContainer.addEventListener('touchend', () => {
    // Lanjutkan scroll setelah 2 detik jari dilepas
    setTimeout(() => isScrollPaused = false, 2000);
});

// --- PROGRESS BAR REFRESH API ---
function resetApiProgress() {
    clearInterval(progressInterval);
    timeRemaining = REFRESH_INTERVAL;
    const progressBar = document.getElementById('refresh-progress');

    progressInterval = setInterval(() => {
        timeRemaining -= 1000;
        const percentage = ((REFRESH_INTERVAL - timeRemaining) / REFRESH_INTERVAL) * 100;
        progressBar.style.width = `${percentage}%`;

        if (timeRemaining <= 0) {
            clearInterval(progressInterval);
            progressBar.style.width = '0%';
            fetchRoomData();
        }
    }, 1000);
}

// --- INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(fetchRoomData, 1000);
});