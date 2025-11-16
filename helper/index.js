function isTimeOverlap(start1, end1, start2, end2) {
    // ubah string waktu (HH:mm) jadi menit total
    const toMinutes = time => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    // validasi dasar (misal input tidak logis)
    if (s1 >= e1 || s2 >= e2) {
        throw new Error("Waktu mulai harus lebih kecil dari waktu selesai");
    }

    // overlap terjadi jika salah satu mulai sebelum yang lain selesai,
    // dan selesai setelah yang lain mulai
    return s1 < e2 && s2 < e1;
}
module.exports = {
    isTimeOverlap
}

// // Contoh penggunaan:
// console.log(isTimeOverlap("07:30", "09:00", "08:00", "10:30")); // true (beririsan)
// console.log(isTimeOverlap("07:30", "09:00", "09:00", "10:30")); // false (tepat bersentuhan, tidak overlap)
// console.log(isTimeOverlap("07:30", "09:00", "09:01", "10:30")); // false (tidak beririsan)
