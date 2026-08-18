const pendingList = document.getElementById('pendingList');
const servedList = document.getElementById('servedList');
const pendingCount = document.getElementById('pendingCount');
const servedCount = document.getElementById('servedCount');
const todayLabel = document.getElementById('todayLabel');
const clockLabel = document.getElementById('clockLabel');

// Map untuk mengontrol animasi per container
const scrollInstances = new Map();

function updateClock() {
    const now = new Date();
    todayLabel.textContent = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    clockLabel.textContent = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(/\./g, ':');
}

/**
 * Menghentikan loop animasi pada container tertentu
 */
function stopAutoScroll(container) {
    if (scrollInstances.has(container)) {
        const instance = scrollInstances.get(container);
        cancelAnimationFrame(instance.animationId);
        container.removeEventListener('mouseenter', instance.onMouseEnter);
        container.removeEventListener('mouseleave', instance.onMouseLeave);
        scrollInstances.delete(container);
    }
}

/**
 * Menjalankan animasi seamless infinite scroll down
 * @param {HTMLElement} container 
 * @param {number} speed Kecepatan scroll (pixel per frame)
 */
function startAutoScroll(container, speed = 0.7) {
    stopAutoScroll(container);

    // Tunggu 1 frame agar browser selesai me-render layout & ukuran card
    requestAnimationFrame(() => {
        // Cek apakah konten memang lebih panjang dari container
        if (container.scrollHeight <= container.clientHeight) return;

        // Duplikasi isi innerHTML agar menjadi loop tanpa batas (infinite)
        const originalContent = container.innerHTML;
        container.innerHTML = originalContent + originalContent;

        let isPaused = false;
        const onMouseEnter = () => { isPaused = true; };
        const onMouseLeave = () => { isPaused = false; };

        container.addEventListener('mouseenter', onMouseEnter);
        container.addEventListener('mouseleave', onMouseLeave);

        function step() {
            if (!isPaused) {
                container.scrollTop += speed;

                // Reset seamless saat mencapai pertengahan (ujung konten asli)
                const halfHeight = container.scrollHeight / 2;
                if (container.scrollTop >= halfHeight) {
                    container.scrollTop -= halfHeight;
                }
            }

            const animationId = requestAnimationFrame(step);
            scrollInstances.set(container, { animationId, onMouseEnter, onMouseLeave });
        }

        const animationId = requestAnimationFrame(step);
        scrollInstances.set(container, { animationId, onMouseEnter, onMouseLeave });
    });
}

function renderEmptyState(container, message) {
    stopAutoScroll(container);
    container.innerHTML = `
    <div class="flex flex-col items-center justify-center h-full text-center text-slate-400">
      <svg class="w-12 h-12 mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m-6-8h6M5 5l14 14"/>
      </svg>
      <p class="text-lg font-medium">${message}</p>
    </div>`;
}

function createCard(item, status) {
    const resep = item.no_resep || '-';
    const pasien = item.reg_periksa?.pasien?.nm_pasien || '-';
    const poli = item.reg_periksa?.poliklinik?.nm_poli || '-';
    const peresepan = `${item.tgl_peresepan || ''} ${item.jam_peresepan || ''}`;

    return `
    <article class="queue-card bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-3xl p-6 shadow-2xl transition-all">
      <!-- Header: Status & No Resep -->
      <div class="flex items-center justify-between mb-8 pb-4 border-b border-slate-700/50">
        <div class="px-5 py-2 rounded-full border-2 ${status === 'pending'
            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
            : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
        }">
          <span class="text-2xl font-bold uppercase tracking-wider">
            ${status === 'pending' ? 'Menunggu' : 'Sudah'}
          </span>
        </div>
        <span class="text-3xl font-black text-slate-500">#${resep}</span>
      </div>

      <!-- Body: Data Pasien -->
      <div class="space-y-6">
        <div>
          <p class="text-xl font-semibold text-slate-400 uppercase tracking-widest mb-1">Nama Pasien</p>
          <p class="text-5xl font-extrabold text-white leading-tight truncate">${pasien}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-6 pt-2">
          <div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50">
            <p class="text-lg font-medium text-slate-400 uppercase tracking-wider mb-1">Poliklinik</p>
            <p class="text-3xl font-bold text-cyan-300 truncate">${poli}</p>
          </div>
          
          <div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50">
            <p class="text-lg font-medium text-slate-400 uppercase tracking-wider mb-1">Waktu Peresepan</p>
            <p class="text-3xl font-bold text-emerald-300 truncate">${peresepan}</p>
          </div>
        </div>
      </div>
    </article>`;
}

function renderDashboard(data) {
    const list = data.data;
    if (!Array.isArray(list) || list.length === 0) {
        renderEmptyState(pendingList, 'Tidak ada data');
        renderEmptyState(servedList, 'Tidak ada data');
        pendingCount.textContent = '0';
        servedCount.textContent = '0';
        return;
    }

    const pending = [];
    const served = [];

    list.forEach(item => {
        const tglPenyerahan = item.tgl_penyerahan;
        if (!tglPenyerahan || tglPenyerahan === '0000-00-00') {
            pending.push(item);
        } else {
            served.push(item);
        }
    });

    pendingCount.textContent = pending.length.toString();
    servedCount.textContent = served.length.toString();

    // Render Pending List
    if (pending.length > 0) {
        pendingList.innerHTML = pending.map(item => createCard(item, 'pending')).join('');
        startAutoScroll(pendingList, 0.7);
    } else {
        renderEmptyState(pendingList, 'Tidak ada antrean pending');
    }

    // Render Served List
    if (served.length > 0) {
        servedList.innerHTML = served.map(item => createCard(item, 'served')).join('');
        startAutoScroll(servedList, 0.7);
    } else {
        renderEmptyState(servedList, 'Tidak ada antrean selesai');
    }
}

async function fetchAntrian() {
    try {
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const API_URL = `https://api.spairum.my.id/api/ralan/antrian/farmasi?status=ralan&tgl_peresepan=${yyyy}-${mm}-${dd}`;

        const response = await fetch(API_URL, {
            headers: { Accept: 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        renderDashboard(data);
    } catch (error) {
        console.error('Gagal memuat data farmasi:', error);
        pendingCount.textContent = '0';
        servedCount.textContent = '0';
        renderEmptyState(pendingList, 'Gagal memuat data');
        renderEmptyState(servedList, 'Gagal memuat data');
    }
}

// Initial Call & Timers
updateClock();
setInterval(updateClock, 1000);

fetchAntrian();
// Interval auto-refresh data dari server (misal 30 detik sekali)
setInterval(fetchAntrian, 30000);