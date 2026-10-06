<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MasterKirimanApi } from '../services/api'

const router = useRouter()

const daftarKiriman = ref([])
const loading = ref(true)
const errorMsg = ref('')

const namaKiriman = ref('')
const kirimanBaru = ref('')
const mauTambahBaru = ref(false)
const nomerPo = ref('')
const presisi = ref(1) // 1 atau 2 angka di belakang koma

async function muatKiriman() {
  loading.value = true
  try {
    const { data } = await MasterKirimanApi.list()
    daftarKiriman.value = data
    if (data.length && !namaKiriman.value) {
      namaKiriman.value = data[0].nama_kiriman
    } else if (!data.length) {
      mauTambahBaru.value = true
    }
  } catch (e) {
    errorMsg.value = 'Gagal memuat daftar kiriman. Cek koneksi ke backend.'
  } finally {
    loading.value = false
  }
}

async function simpanKirimanBaru() {
  const nama = kirimanBaru.value.trim()
  if (!nama) return
  try {
    const { data } = await MasterKirimanApi.create(nama)
    daftarKiriman.value.push(data)
    namaKiriman.value = data.nama_kiriman
    kirimanBaru.value = ''
    mauTambahBaru.value = false
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || 'Nama kiriman gagal disimpan (mungkin sudah ada).'
  }
}

function mulai() {
  errorMsg.value = ''
  if (!namaKiriman.value) {
    errorMsg.value = 'Pilih atau tambahkan nama kiriman dulu.'
    return
  }
  if (!nomerPo.value.trim()) {
    errorMsg.value = 'Nomor PO wajib diisi.'
    return
  }
  router.push({
    name: 'input',
    query: {
      nama_kiriman: namaKiriman.value,
      nomer_po: nomerPo.value.trim(),
      presisi: presisi.value,
    },
  })
}

const draftActive = ref(null)

onMounted(() => {
  muatKiriman()

  // Cek apakah ada draft di localStorage
  const saved = localStorage.getItem('draft_timbangan')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.nilaiList && parsed.nilaiList.length > 0) {
        draftActive.value = parsed
      }
    } catch (e) {}
  }
})

function hapusDraft() {
  if (confirm('Yakin ingin menghapus sesi yang belum disimpan ini?')) {
    localStorage.removeItem('draft_timbangan')
    draftActive.value = null
  }
}

function lanjutkanDraft() {
  router.push({ name: 'input', query: { resume: '1' } })
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <!-- Glassmorphic Draft Alert -->
    <div
      v-if="draftActive"
      class="glass-card p-4 mb-6 border border-amber/40 bg-amber-500/10 shadow-[6px_6px_16px_rgba(217,119,6,0.15),-6px_-6px_16px_rgba(255,255,255,0.9)]"
    >
      <div class="mb-2">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber animate-pulse"></span>
          <p class="font-bold text-ink text-sm">Ada Sesi Belum Disimpan</p>
        </div>
        <p class="text-xs text-muted mt-1">
          {{ draftActive.nama_kiriman }} · PO: <span class="font-mono font-bold text-ink">{{ draftActive.nomer_po }}</span>
          <br />Terisi: <span class="font-bold text-amber-deep">{{ draftActive.nilaiList.length }} data timbangan</span>
        </p>
      </div>
      <div class="flex gap-2 mt-3">
        <button class="btn-amber flex-1 py-2 text-xs" @click="lanjutkanDraft">Lanjutkan Sesi</button>
        <button class="btn-ghost py-2 text-xs" @click="hapusDraft">Hapus Draft</button>
      </div>
    </div>

    <!-- Header Section -->
    <div class="mb-6">
      <span class="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider text-amber-deep bg-amber-400/15 border border-amber-400/30 shadow-neu-xs mb-2">
        MULAI SESI BARU
      </span>
      <h1 class="text-2xl font-extrabold text-ink tracking-tight">Input Timbangan Ayam</h1>
      <p class="text-xs text-muted mt-1 leading-relaxed">
        Pilih nama kiriman, isi nomor PO, dan tentukan presisi angka sebelum mulai proses penimbangan.
      </p>
    </div>

    <!-- Main Glass-Neumorphic Card -->
    <div class="glass-card p-6 shadow-neu space-y-5 border border-white/80">
      <!-- Field: Nama Kiriman -->
      <div>
        <label class="field-label">Nama Kiriman</label>
        <div v-if="!mauTambahBaru" class="flex gap-2">
          <select v-model="namaKiriman" class="field-input cursor-pointer" :disabled="loading">
            <option v-for="k in daftarKiriman" :key="k.id" :value="k.nama_kiriman">
              {{ k.nama_kiriman }}
            </option>
          </select>
          <button class="btn-ghost whitespace-nowrap !px-3.5" @click="mauTambahBaru = true">
            + Baru
          </button>
        </div>
        <div v-else class="flex gap-2">
          <input
            v-model="kirimanBaru"
            class="field-input"
            placeholder="Nama kiriman baru…"
            @keyup.enter="simpanKirimanBaru"
          />
          <button class="btn-amber whitespace-nowrap !px-4" @click="simpanKirimanBaru">Simpan</button>
          <button
            v-if="daftarKiriman.length"
            class="btn-ghost whitespace-nowrap !px-3"
            @click="mauTambahBaru = false"
          >
            Batal
          </button>
        </div>
      </div>

      <!-- Field: Nomor PO -->
      <div>
        <label class="field-label">Nomor PO</label>
        <input
          v-model="nomerPo"
          class="field-input font-mono"
          placeholder="Misal: PO-2026-0708-01"
          @keyup.enter="mulai"
        />
      </div>

      <!-- Field: Presisi Angka -->
      <div>
        <label class="field-label">Presisi Angka</label>
        <div class="grid grid-cols-2 gap-3 p-1.5 bg-canvas-dark/40 rounded-neu-sm shadow-neu-inset-sm border border-white/40">
          <button
            type="button"
            class="py-3 px-3 rounded-xl text-xs font-semibold transition-all duration-150 flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            :class="presisi === 1
              ? 'bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-[3px_3px_8px_rgba(15,23,42,0.4),-2px_-2px_6px_rgba(255,255,255,0.7)] border border-slate-700'
              : 'text-muted hover:text-ink hover:bg-white/40'"
            @click="presisi = 1"
          >
            <span>1 Desimal</span>
            <span class="font-mono text-[11px] opacity-75">(4.1 kg)</span>
          </button>

          <button
            type="button"
            class="py-3 px-3 rounded-xl text-xs font-semibold transition-all duration-150 flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            :class="presisi === 2
              ? 'bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-[3px_3px_8px_rgba(15,23,42,0.4),-2px_-2px_6px_rgba(255,255,255,0.7)] border border-slate-700'
              : 'text-muted hover:text-ink hover:bg-white/40'"
            @click="presisi = 2"
          >
            <span>2 Desimal</span>
            <span class="font-mono text-[11px] opacity-75">(4.15 kg)</span>
          </button>
        </div>
        <p class="text-[11px] text-muted mt-2">
          Mode 1 desimal menggunakan tombol cepat (4.1–6.0). Mode 2 desimal menggunakan slider analog presisi.
        </p>
      </div>

      <p v-if="errorMsg" class="text-xs text-rust font-semibold bg-rose-50/80 p-2.5 rounded-lg border border-rose-200/60">{{ errorMsg }}</p>

      <!-- Submit CTA Button -->
      <button class="btn-amber w-full text-sm py-4 rounded-neu-sm mt-2 font-bold tracking-wide shadow-[5px_5px_15px_rgba(217,119,6,0.35),-4px_-4px_12px_rgba(255,255,255,0.9)]" @click="mulai">
        Mulai Input Timbangan →
      </button>
    </div>
  </div>
</template>
