/**
 * OASIS Local Database Manager
 * Mengelola penyimpanan akun pengguna (registrasi & login) menggunakan LocalStorage.
 */

const OasisDB = (function () {
  const USERS_STORAGE_KEY = 'oasis_users_db';
  const CURRENT_USER_KEY = 'oasis_current_user';

  // Inisialisasi database lokal dengan akun demo jika belum ada
  function initDB() {
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
      const defaultUsers = [
        {
          id: 'usr_demo_01',
          name: 'Budi Santoso',
          email: 'budi@oasis.ae',
          password: 'password123',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    }
  }

  // Mengambil seluruh data user
  function getAllUsers() {
    initDB();
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Gagal membaca database lokal', e);
      return [];
    }
  }

  // Cari user berdasarkan email
  function findUserByEmail(email) {
    if (!email) return null;
    const users = getAllUsers();
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  // Registrasi user baru
  function registerUser({ name, email, password }) {
    initDB();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !password) {
      return { success: false, message: 'Semua kolom wajib diisi.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Kata sandi minimal 6 karakter.' };
    }

    const existingUser = findUserByEmail(cleanEmail);
    if (existingUser) {
      return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau langsung login.' };
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: cleanName,
      email: cleanEmail,
      password: password,
      createdAt: new Date().toISOString()
    };

    const users = getAllUsers();
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    return { success: true, message: 'Registrasi berhasil! Silakan masuk dengan akun Anda.', user: newUser };
  }

  // Autentikasi / Login user
  function loginUser(email, password) {
    initDB();
    const cleanEmail = email.trim().toLowerCase();
    const user = findUserByEmail(cleanEmail);

    if (!user) {
      return { success: false, message: 'Akun belum terdaftar. Silakan lakukan registrasi terlebih dahulu.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Kata sandi salah. Silakan periksa kembali.' };
    }

    // Set sesi pengguna saat ini
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));

    return { success: true, message: 'Login berhasil!', user: sessionData };
  }

  // Mendapatkan data user yang sedang login
  function getCurrentUser() {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  // Cek apakah ada user yang sedang login
  function isAuthenticated() {
    return getCurrentUser() !== null;
  }

  // Logout
  function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
  }

  // Auto init saat dimuat
  initDB();

  return {
    getAllUsers,
    findUserByEmail,
    registerUser,
    loginUser,
    getCurrentUser,
    isAuthenticated,
    logout
  };
})();

// Ekspor ke global window
if (typeof window !== 'undefined') {
  window.OasisDB = OasisDB;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OasisDB;
}

