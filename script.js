// ====================================================================
// 1. INITIALIZATION FIREBASE (SINKRONISASI COCOK UNTUK VERSI 9.0.0 COMPAT)
// ====================================================================
const firebaseConfig = {
    apiKey: "AIzaSyAz9WumMNc97Ul-QnONh5rI0hKXh5ZelRY",
    authDomain: "toko-aa-ef6aa.firebaseapp.com",
    databaseURL: "https://toko-aa-ef6aa-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "toko-aa-ef6aa",
    storageBucket: "toko-aa-ef6aa.firebasestorage.app",
    messagingSenderId: "923877778887",
    appId: "1:923877778887:web:5eaf71243d582049c825e2"
};

let db;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.database();
    window.FastBiteDB = db; // Sediakan akses global database untuk folder Admin
} catch (error) {
    alert("Firebase gagal terhubung. Periksa koneksi internet tablet Anda!");
    console.error("Firebase Gagal Memuat:", error);
}

// ====================================================================
// 2. ENGINE OTENTIKASI LOGIN (OTOMATIS PINDAH TANPA ALERT BEBAS HAMBATAN)
// ====================================================================
window.addEventListener('load', () => {
    const loginForm = document.getElementById('loginForm');
    
    // Jalur Utama: Jika index.html menggunakan elemen form id="loginForm"
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            prosesValidasiInputForm();
        });
    } else {
        // Jalur Cadangan: Jika index.html menggunakan button onclick manual bawaan lama
        const btnLoginLama = document.querySelector('button[onclick*="Login"]') || document.querySelector('button');
        if (btnLoginLama) {
            btnLoginLama.addEventListener('click', (e) => {
                e.preventDefault();
                prosesValidasiInputForm();
            });
        }
    }
});

// Fungsi penangkap isi teks kotak input form
function prosesValidasiInputForm() {
    const inputUser = document.getElementById('username') || document.getElementById('user') || document.querySelector('input[type="text"]');
    const inputPass = document.getElementById('password') || document.getElementById('pass') || document.querySelector('input[type="password"]');

    if (!inputUser || !inputPass) {
        alert("Eror: Struktur input form tidak terbaca!");
        return;
    }

    const usernameValue = inputUser.value.trim().toLowerCase();
    const passwordValue = inputPass.value.trim();

    if (usernameValue === "" || passwordValue === "") {
        alert("Mohon isi Username dan Password terlebih dahulu!");
        return;
    }

    eksekusiValidasiLogin(usernameValue, passwordValue);
}

// Fungsi inti pencocokan kredensial akun ke Firebase Cloud
function eksekusiValidasiLogin(username, password) {
    if (!db) {
        alert("Koneksi database terputus!");
        return;
    }

    // MEMBUAT TEKS TIMESTAMP DIGITAL WAKTU SEKARANG (WIB)
    const tglAktif = new Date();
    const stringWaktuSekarang = tglAktif.getFullYear() + '-' + 
                                String(tglAktif.getMonth() + 1).padStart(2, '0') + '-' + 
                                String(tglAktif.getDate()).padStart(2, '0') + ' ' + 
                                String(tglAktif.getHours()).padStart(2, '0') + ':' + 
                                String(tglAktif.getMinutes()).padStart(2, '0') + ':' + 
                                String(tglAktif.getSeconds()).padStart(2, '0');

    // 1. Akun Admin Utama FastBite Anda (User: admin, Pass: zzz) -> Langsung tembus instan[span_2](start_span)[span_2](end_span)
    if (username === 'admin' && password === 'zzz') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('username', 'admin');
        
        // UPGRADE: Rekam lastActive untuk akun admin di Firebase node users/admin
        db.ref('users/admin').update({
            nama: "Admin Utama",
            password: "zzz",
            role: "admin",
            lastActive: stringWaktuSekarang
        });

        // Pindah otomatis sekejap mata tanpa popup alert OK[span_3](start_span)[span_3](end_span)
        window.location.href = 'Admin/admin.html';
        return;
    }

    console.log("Sedang mencari data user: " + username);

    // 2. Tarik Akun Customer dari Node 'users/' Firebase Realtime Anda[span_4](start_span)[span_4](end_span)
    db.ref('users/' + username).once('value', (snapshot) => {
        if (!snapshot.exists()) {
            alert(`Username "${username}" tidak ditemukan!`);
            return;
        }

        const dataUser = snapshot.val();
        if (dataUser && dataUser.password === password) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', dataUser.role || 'customer');
            localStorage.setItem('username', username);
            
            // UPGRADE: Rekam lastActive untuk customer yang berhasil login ke node-nya masing-masing
            db.ref('users/' + username).update({
                lastActive: stringWaktuSekarang
            });

            // Pindah otomatis sekejap mata tanpa popup alert OK[span_5](start_span)[span_5](end_span)
            window.location.href = 'dashboard.html';
        } else {
            alert('Password yang Anda masukkan salah!');
        }
    }).catch((err) => {
        alert("Gagal membaca database. Periksa rules Firebase Anda.");
        console.error(err);
    });
}


// ====================================================================
// 3. ENGINE INFINITE SCROLL & RENDERING DASHBOARD (TETAP SAMA)
// ====================================================================
window.inisialisasiDashboardRealtime = function() {
    let databaseMenu = [];
    let halamanSekarang = 1;
    const limitPerMuat = 8;
    let dataSudahHabis = false;

    const container = document.getElementById('produk-container');
    if (!container || !db) return;

    db.ref('databaseMenu').on('value', (snapshot) => {
        const dataCloud = snapshot.val() || [];
        databaseMenu = Array.isArray(dataCloud) ? dataCloud.filter(item => item !== null) : Object.values(dataCloud);
        container.innerHTML = '';
        halamanSekarang = 1;
        dataSudahHabis = false;
        if (typeof muatMenuKatalog === 'function') muatMenuKatalog();
    });
};
