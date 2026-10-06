<script setup>
import { ref, onMounted, watch } from 'vue'
import { RiwayatInputApi } from '../services/api'

const items = ref([])
const meta = ref({ current_page: 1, last_page: 1 })
const loading = ref(true)
const errorMsg = ref('')

const filterNama = ref('')
const filterPo = ref('')
const page = ref(1)

const detail = ref(null)

async function muat() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await RiwayatInputApi.list({
      nama_kiriman: filterNama.value || undefined,
      nomer_po: filterPo.value || undefined,
      page: page.value,
    })
    items.value = data.data
    meta.value = data
  } catch (e) {
    errorMsg.value = 'Gagal memuat riwayat. Cek koneksi ke backend.'
  } finally {
    loading.value = false
  }
}

async function hapus(item) {
  if (!confirm(`Hapus riwayat ${item.nama_kiriman} · ${item.nomer_po}?`)) return
  try {
    await RiwayatInputApi.remove(item.id)
    items.value = items.value.filter((i) => i.id !== item.id)
  } catch (e) {
    alert('Gagal menghapus.')
  }
}

function formatTanggal(t) {
  return new Date(t).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

watch([filterNama, filterPo], () => {
  page.value = 1
  muat()
})
watch(page, muat)

onMounted(muat)
</script>

<template>
  <div class="max-w-2xl mx-auto pb-12">
    <!-- Header -->
    <div class="mb-5">
      <span class="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider text-amber-deep bg-amber-400/15 border border-amber-400/30 shadow-neu-xs mb-2">
        RIWAYAT
      </span>
      <h1 class="text-2xl font-extrabold text-ink tracking-tight">Hasil Timbangan Tersimpan</h1>
      <p class="text-xs text-muted mt-1">Daftar rekam sampling penimbangan ayam per pengiriman (PO).</p>
    </div>

    <!-- Filter Bar (Frosted Glass Container) -->
    <div class="glass-card p-4 mb-5 shadow-neu-sm border border-white/80 flex flex-col sm:flex-row gap-3">
      <div class="flex-1">
        <input
          v-model="filterNama"
          class="field-input text-xs"
          placeholder="Filter nama kiriman…"
        />
      </div>
      <div class="flex-1">
        <input
          v-model="filterPo"
          class="field-input font-mono text-xs"
          placeholder="Cari nomor PO…"
        />
      </div>
    </div>

    <p v-if="errorMsg" class="text-xs text-rust font-semibold bg-rose-50/80 p-3 rounded-lg border border-rose-200/60 mb-4">{{ errorMsg }}</p>

    <!-- Loading State -->
    <div v-if="loading" class="glass-card p-8 text-center text-muted shadow-neu-sm border border-white/80">
      <div class="inline-block w-6 h-6 border-2 border-amber border-t-transparent rounded-full animate-spin mb-2"></div>
      <p class="text-xs font-mono">Memuat data riwayat…</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!items.length" class="glass-card p-10 text-center text-muted shadow-neu-sm border border-white/80">
      <p class="text-sm font-semibold text-ink mb-1">Belum ada riwayat yang cocok</p>
      <p class="text-xs">Coba sesuaikan kata kunci filter atau buat sesi penimbangan baru.</p>
    </div>

    <!-- History Cards List -->
    <div v-else class="space-y-3.5">
      <div
        v-for="item in items"
        :key="item.id"
        class="glass-card p-4 sm:p-5 shadow-neu-sm border border-white/85 hover:border-white transition-all duration-150"
      >
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="min-w-0">
            <h3 class="font-extrabold text-ink text-base truncate">{{ item.nama_kiriman }}</h3>
            <p class="font-mono text-[11px] text-muted mt-0.5">
              <span class="text-amber-deep font-bold">{{ item.nomer_po }}</span> · {{ formatTanggal(item.created_at) }}
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button class="btn-ghost !px-3 !py-1.5 text-xs font-bold" @click="detail = item">
              Detail
            </button>
            <button class="btn-danger !px-3 !py-1.5 text-xs font-bold" @click="hapus(item)">
              Hapus
            </button>
          </div>
        </div>

        <!-- 4-Column Stat Tiles -->
        <div class="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200/60">
          <div class="neu-inset py-2 px-1 text-center rounded-xl">
            <p class="text-[9px] font-mono uppercase text-muted tracking-wider">Total</p>
            <p class="font-mono font-bold text-sm text-ink tabular-nums">{{ item.total_data }}</p>
          </div>
          <div class="neu-inset py-2 px-1 text-center rounded-xl">
            <p class="text-[9px] font-mono uppercase text-muted tracking-wider">Sum</p>
            <p class="font-mono font-bold text-sm text-ink tabular-nums">{{ Number(item.rata_rata).toFixed(2) }}</p>
          </div>
          <div class="neu-inset py-2 px-1 text-center rounded-xl">
            <p class="text-[9px] font-mono uppercase text-muted tracking-wider">Max</p>
            <p class="font-mono font-bold text-sm text-leaf tabular-nums">{{ Number(item.nilai_max).toFixed(2) }}</p>
          </div>
          <div class="neu-inset py-2 px-1 text-center rounded-xl">
            <p class="text-[9px] font-mono uppercase text-muted tracking-wider">Min</p>
            <p class="font-mono font-bold text-sm text-rust tabular-nums">{{ Number(item.nilai_min).toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="meta.last_page > 1" class="flex justify-center items-center gap-3 mt-6">
      <button class="btn-ghost !px-3.5 !py-2 text-xs font-bold" :disabled="page <= 1" @click="page--">
        ← Prev
      </button>
      <span class="text-xs text-muted font-mono bg-white/50 px-3 py-1 rounded-full border border-white/60">
        {{ page }} / {{ meta.last_page }}
      </span>
      <button class="btn-ghost !px-3.5 !py-2 text-xs font-bold" :disabled="page >= meta.last_page" @click="page++">
        Next →
      </button>
    </div>

    <!-- Detail Modal (Frosted Glass Overlay + Card) -->
    <div
      v-if="detail"
      class="fixed inset-0 bg-slate-900/35 backdrop-blur-md flex items-end sm:items-center justify-center p-4 z-40 transition-opacity"
      @click.self="detail = null"
    >
      <div class="glass-card p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl border border-white/95">
        <div class="flex items-start justify-between mb-4 pb-3 border-b border-slate-200/60">
          <div>
            <h3 class="font-extrabold text-ink text-lg">{{ detail.nama_kiriman }}</h3>
            <p class="font-mono text-xs text-amber-deep font-bold">{{ detail.nomer_po }}</p>
          </div>
          <button
            class="w-7 h-7 rounded-full bg-white/70 hover:bg-white text-muted hover:text-ink flex items-center justify-center text-sm shadow-neu-xs transition cursor-pointer"
            @click="detail = null"
          >
            ✕
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-4">
          <div class="neu-inset p-2.5 rounded-xl text-center">
            <span class="text-[10px] text-muted block uppercase font-mono">Total Data</span>
            <span class="font-mono font-bold text-sm">{{ detail.total_data }} butir</span>
          </div>
          <div class="neu-inset p-2.5 rounded-xl text-center">
            <span class="text-[10px] text-muted block uppercase font-mono">Total Berat</span>
            <span class="font-mono font-bold text-sm text-amber-deep">{{ Number(detail.rata_rata).toFixed(2) }} kg</span>
          </div>
        </div>

        <p class="field-label !mb-2">Data Mentah Nilai Timbangan ({{ detail.total_data }})</p>
        <div class="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
          <span
            v-for="(v, i) in detail.data_input"
            :key="i"
            class="stub font-mono text-xs py-1 px-2.5 bg-white/80 shadow-neu-xs border border-white/80"
          >
            {{ Number(v).toFixed(2) }}
          </span>
        </div>

        <button class="neu-btn w-full py-3 text-xs font-bold mt-5" @click="detail = null">
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>
