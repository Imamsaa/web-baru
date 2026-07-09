// ==========================================
// 1. INISIALISASI FIREBASE FIRESTORE
// ==========================================
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app-check.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyAORCF3YPW6vWnPqTWUFmIpbMHPB8vPWHg",
authDomain: "dibaliklayar-6623b.firebaseapp.com",
projectId: "dibaliklayar-6623b",
storageBucket: "dibaliklayar-6623b.firebasestorage.app",
messagingSenderId: "894922389545",
appId: "1:894922389545:web:d4d520b83a576e22194438",
measurementId: "G-7D32ZHB487"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const appCheck = initializeAppCheck(app, {
  // TODO: Paste Site Key yang Bapak copy dari Google Cloud tadi ke sini
  provider: new ReCaptchaEnterpriseProvider('6Lf3K0stAAAAABYxoXjjJbGQlY9ZjTw8OtFgo44b'),
  isTokenAutoRefreshEnabled: true
});
// ==========================================
// 2. SPA ROUTING LOGIC
// ==========================================
function navigateTo(viewId) {
    const viewBrosur = document.getElementById('view-brosur');
    const viewDaftar = document.getElementById('view-daftar');
    const viewSukses = document.getElementById('view-sukses');
    const navBrosur = document.getElementById('nav-brosur');
    const navDaftar = document.getElementById('nav-daftar');

    if (!viewBrosur || !viewDaftar || !navBrosur || !navDaftar) return;

    viewBrosur.classList.add('hidden');
    viewBrosur.classList.remove('active');
    viewDaftar.classList.add('hidden');
    viewDaftar.classList.remove('active');
    if (viewSukses) {
        viewSukses.classList.add('hidden');
        viewSukses.classList.remove('active');
    }

    const activeNavStyle = ['text-primary', 'font-bold', 'border-b-2', 'border-primary'];
    const inactiveNavStyle = ['text-gray-500'];

    navBrosur.classList.remove(...activeNavStyle);
    navBrosur.classList.add(...inactiveNavStyle);
    navDaftar.classList.remove(...activeNavStyle);
    navDaftar.classList.add(...inactiveNavStyle);

    if (viewId === 'brosur') {
        viewBrosur.classList.remove('hidden');
        setTimeout(() => viewBrosur.classList.add('active'), 10);
        navBrosur.classList.remove(...inactiveNavStyle);
        navBrosur.classList.add(...activeNavStyle);
    } else if (viewId === 'daftar') {
        viewDaftar.classList.remove('hidden');
        setTimeout(() => viewDaftar.classList.add('active'), 10);
        navDaftar.classList.remove(...inactiveNavStyle);
        navDaftar.classList.add(...activeNavStyle);
    } else if (viewId === 'sukses') {
        if (viewSukses) {
            viewSukses.classList.remove('hidden');
            setTimeout(() => viewSukses.classList.add('active'), 10);
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// WAJIB DITAMBAHKAN AGAR BISA DIPANGGIL HTML SAAT MENGGUNAKAN TYPE="MODULE"
window.navigateTo = navigateTo;

// ==========================================
// 3. VARIABEL & FUNGSI MULTI-STEP
// ==========================================
let currentStep = 0;
let steps = [];
let progressBar, stepIndicators;

function updateFormSteps() {
    if (steps.length === 0) return;

    steps.forEach((step, index) => {
        if (index === currentStep) {
            step.classList.remove('hidden');
            setTimeout(() => step.classList.add('active'), 10);
        } else {
            step.classList.add('hidden');
            step.classList.remove('active');
        }
    });

    if (progressBar) {
        const progressPercentage = ((currentStep + 1) / steps.length) * 100;
        progressBar.style.width = progressPercentage + '%';
    }

    if (stepIndicators && stepIndicators.length > 0) {
        Array.from(stepIndicators).forEach((indicator, index) => {
            if (index <= currentStep) {
                indicator.classList.add('text-primary');
                indicator.classList.remove('text-gray-500');
            } else {
                indicator.classList.remove('text-primary');
                indicator.classList.add('text-gray-500');
            }
        });
    }
    
    localStorage.setItem('draftStepPendaftaran', currentStep);
    const formElement = document.getElementById('formPendaftaran');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==========================================
// 4. INISIALISASI HALAMAN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    navigateTo('daftar');

    steps = Array.from(document.querySelectorAll('.form-step'));
    progressBar = document.getElementById('progress-bar');
    
    const indicatorsContainer = document.getElementById('step-indicators');
    if (indicatorsContainer) {
        stepIndicators = indicatorsContainer.children;
    }

    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const formPendaftaran = document.getElementById('formPendaftaran');

    const checkboxWali = document.getElementById('checkboxWali');
    const containerWali = document.getElementById('containerWali');

    if (formPendaftaran) {
        // --- AUTO LOAD DATA ---
        const savedData = localStorage.getItem('draftDataPendaftaran');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                Object.keys(parsedData).forEach(key => {
                    const inputElement = formPendaftaran.elements[key];
                    if (inputElement) {
                        if (inputElement.type === 'checkbox') {
                            inputElement.checked = parsedData[key] === 'on';
                        } else {
                            inputElement.value = parsedData[key];
                        }
                    }
                });
            } catch (error) {
                console.error("Gagal memuat draft:", error);
            }
        }

        const savedStep = localStorage.getItem('draftStepPendaftaran');
        if (savedStep !== null) currentStep = parseInt(savedStep, 10);
        updateFormSteps();

        // --- CHECKBOX WALI LOGIC ---
        if (checkboxWali && containerWali) {
            if (checkboxWali.checked) containerWali.classList.remove('hidden');
            
            checkboxWali.addEventListener('change', function() {
                if (this.checked) {
                    containerWali.classList.remove('hidden');
                } else {
                    containerWali.classList.add('hidden');
                    const inputsWali = containerWali.querySelectorAll('input, select, textarea');
                    inputsWali.forEach(input => input.value = '');
                    const formDataObj = Object.fromEntries(new FormData(formPendaftaran).entries());
                    localStorage.setItem('draftDataPendaftaran', JSON.stringify(formDataObj));
                }
            });
        }

        // --- AUTO SAVE DATA ---
        formPendaftaran.addEventListener('input', function() {
            const formDataObj = Object.fromEntries(new FormData(formPendaftaran).entries());
            localStorage.setItem('draftDataPendaftaran', JSON.stringify(formDataObj));
        });

        formPendaftaran.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault(); 
                if (currentStep < steps.length - 1) {
                    const currentNextBtn = steps[currentStep].querySelector('.btn-next');
                    if (currentNextBtn) currentNextBtn.click();
                }
            }
        });

        // ==========================================
        // 5. PENGIRIMAN DATA KE FIREBASE
        // ==========================================
        formPendaftaran.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const lastSubmitTime = localStorage.getItem('lastSubmitTime');
            if (lastSubmitTime) {
                const timeDiff = new Date().getTime() - parseInt(lastSubmitTime);
                // Jika jarak pengiriman kurang dari 120.000 milidetik (2 menit)
                if (timeDiff < 120000) {
                    alert("Anda baru saja mengirimkan formulir. Mohon tunggu 2 menit sebelum mendaftar lagi.");
                    return; // Hentikan eksekusi pengiriman data
                }
            }

            const formData = new FormData(this);
            const dataPendaftar = {
                siswa: {
                    nama: formData.get('namaSiswa'),
                    nisn: formData.get('nisn'),
                    asalSekolah: formData.get('asalSekolah'),
                    jenisKelamin: formData.get('jenisKelamin'),
                    pilihanProgram: formData.get('pilihanProgram'),
                    tempatLahir: formData.get('tempatLahir'),
                    tanggalLahir: formData.get('tanggalLahir'),
                    alamatDetail: {
                        jalan: formData.get('alamat'),
                        kecamatan: formData.get('kecamatan'),
                        kabupaten: formData.get('kabupaten'),
                        provinsi: formData.get('provinsi')
                    },
                    agama: formData.get('agama'),
                    anakKe: formData.get('anakKe')
                },
                orangTua: {
                    ayah: {
                        nama: formData.get('namaAyah'),
                        pendidikan: formData.get('pendidikanAyah'),
                        tempatLahir: formData.get('tempatLahirAyah'),
                        tanggalLahir: formData.get('tanggalLahirAyah'),
                        alamat: formData.get('alamatAyah'),
                        pekerjaan: formData.get('pekerjaanAyah')
                    },
                    ibu: {
                        nama: formData.get('namaIbu'),
                        pendidikan: formData.get('pendidikanIbu'),
                        tempatLahir: formData.get('tempatLahirIbu'),
                        tanggalLahir: formData.get('tanggalLahirIbu'),
                        alamat: formData.get('alamatIbu'),
                        pekerjaan: formData.get('pekerjaanIbu')
                    }
                },
                wali: {
                    nama: formData.get('namaWali') || "-",
                    hubungan: formData.get('hubunganWali') || "-",
                    pendidikan: formData.get('pendidikanWali') || "-",
                    tempatLahir: formData.get('tempatLahirWali') || "-",
                    tanggalLahir: formData.get('tanggalLahirWali') || "-",
                    alamat: formData.get('alamatWali') || "-",
                    pekerjaan: formData.get('pekerjaanWali') || "-"
                },
                kontak: {
                    whatsapp: formData.get('noWa')
                },
                timestamp: new Date().toISOString()
            };

            // Loading state pada tombol
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = "Mengirim Data...";
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');

            try {
                // KIRIM KE KOLEKSI: pps_smpit
                const docRef = await addDoc(collection(db, "pps_smpit"), dataPendaftar);
                console.log("Sukses tersimpan dengan ID: ", docRef.id);

                localStorage.setItem('lastSubmitTime', new Date().getTime().toString());
                
                // Hapus local storage
                localStorage.removeItem('draftDataPendaftaran');
                localStorage.removeItem('draftStepPendaftaran');
                
                // Reset UI Form
                this.reset();
                if(containerWali) containerWali.classList.add('hidden');
                currentStep = 0;
                updateFormSteps();

                // Tampilkan nama di halaman sukses
                const namaSuksesEl = document.getElementById('nama-sukses');
                if (namaSuksesEl) namaSuksesEl.textContent = dataPendaftar.siswa.nama;

                // Injeksi data ke format cetak PDF
                const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
                document.getElementById('print-waktu').textContent = `: ${new Date().toLocaleDateString('id-ID', dateOptions)} WIB`;
                document.getElementById('print-nama').textContent = `: ${dataPendaftar.siswa.nama}`;
                document.getElementById('print-nisn').textContent = `: ${dataPendaftar.siswa.nisn}`;
                document.getElementById('print-asal').textContent = `: ${dataPendaftar.siswa.asalSekolah}`;
                document.getElementById('print-program').textContent = `: ${dataPendaftar.siswa.pilihanProgram}`;
                
                let namaWaliCetak = (formData.get('isWali') === 'on' && dataPendaftar.wali.nama !== "-") 
                                    ? dataPendaftar.wali.nama 
                                    : (dataPendaftar.orangTua.ayah.nama || dataPendaftar.orangTua.ibu.nama || "Orang Tua/Wali");
                
                document.getElementById('print-ortu').textContent = `: ${namaWaliCetak}`;
                document.getElementById('print-wa').textContent = `: ${dataPendaftar.kontak.whatsapp}`;
                document.getElementById('print-ttd-ortu').textContent = `( ${namaWaliCetak} )`;

                // Pindah ke Halaman Sukses
                navigateTo('sukses');

            } catch (error) {
                console.error("Gagal mengirim:", error);
                alert("Gagal mengirim data. Pastikan koneksi internet lancar.");
            } finally {
                // Kembalikan tombol ke keadaan normal
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }

    // --- LOGIKA TOMBOL NAVIGASI STEP ---
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStepEl = steps[currentStep];
            if (!currentStepEl) return;

            const inputs = currentStepEl.querySelectorAll('input, select, textarea');
            let allValid = true;

            for (let i = 0; i < inputs.length; i++) {
                if (!inputs[i].checkValidity()) {
                    inputs[i].reportValidity(); 
                    allValid = false;
                    break; 
                }
            }

            if (allValid && currentStep < steps.length - 1) {
                currentStep++;
                updateFormSteps();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateFormSteps();
            }
        });
    });
});