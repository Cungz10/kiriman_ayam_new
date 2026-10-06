<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RiwayatInputApi } from '../services/api'

const route = useRoute()
const router = useRouter()

const namaKiriman = ref('')
const nomerPo = ref('')
const presisi = ref(1)

const nilaiList = ref([])
const sliderVal = ref(5.0)
const lastAdded = ref(null)

const saving = ref(false)
const savedOk = ref(false)
const errorMsg = ref('')

const tombolCepat = computed(() => {
  const arr = []
  for (let i = 41; i <= 60; i++) {
    arr.push(Math.round(i) / 10)
  }
  return arr
})

const total = computed(() => nilaiList.value.length)
const jumlahSum = computed(() => {
  if (!total.value) return 0
  const sum = nilaiList.value.reduce((a, b) => a + b, 0)
  return Math.round(sum * 100) / 100
})
const nilaiMax = computed(() => (total.value ? Math.max(...nilaiList.value) : 0))
const nilaiMin = computed(() => (total.value ? Math.min(...nilaiList.value) : 0))

function tambahNilai(v) {
  const val = Math.round(v * 100) / 100
  nilaiList.value.push(val)
  lastAdded.value = val
}

function hapusIndex(i) {
  nilaiList.value.splice(i, 1)
}

function undoTerakhir() {
  nilaiList.value.pop()
}

function resetSemua() {
  if (!nilaiList.value.length) return
  if (confirm('Hapus semua data yang sudah diinput di sesi ini?')) {
    nilaiList.value = []
    lastAdded.value = null
    localStorage.removeItem('draft_timbangan')
  }
}

async function simpanSelesai() {
  errorMsg.value = ''
  if (!nilaiList.value.length) {
    errorMsg.value = 'Belum ada data yang diinput.'
    return
  }
  saving.value = true
  try {
    await RiwayatInputApi.create({
      nama_kiriman: namaKiriman.value,
      nomer_po: nomerPo.value,
      nilai: nilaiList.value,
    })
    savedOk.value = true
    localStorage.removeItem('draft_timbangan')
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || 'Gagal menyimpan ke server.'
  } finally {
    saving.value = false
  }
}

function inputBaru() {
  router.push({ name: 'start' })
}

onMounted(() => {
  const queryNama = route.query.nama_kiriman || ''
  const queryPo = route.query.nomer_po || ''
  const queryPresisi = route.query.presisi ? Number(route.query.presisi) : 1

  const draft = JSON.parse(localStorage.getItem('draft_timbangan') || 'null')

  if (route.query.resume === '1' && draft) {
    namaKiriman.value = draft.nama_kiriman
    nomerPo.value = draft.nomer_po
    presisi.value = draft.presisi
    nilaiList.value = draft.nilaiList || []
    return
  }

  if (queryNama && queryPo) {
    namaKiriman.value = queryNama
    nomerPo.value = queryPo
    presisi.value = queryPresisi

    if (draft && draft.nama_kiriman === queryNama && draft.nomer_po === queryPo) {
      nilaiList.value = draft.nilaiList || []
    }
  } else {
    router.replace({ name: 'start' })
  }
})

watch(
  [nilaiList, namaKiriman, nomerPo, presisi],
  () => {
    if (namaKiriman.value && nomerPo.value && !savedOk.value) {
      localStorage.setItem(
        'draft_timbangan',
        JSON.stringify({
          nama_kiriman: namaKiriman.value,
          nomer_po: nomerPo.value,
          presisi: presisi.value,
          nilaiList: nilaiList.value,
        })
      )
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="max-w-lg mx-auto pb-32">
    <div v-if="!savedOk">
      <!-- Session Header -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold text-amber-deep bg-amber-400/15 border border-amber-400/30 shadow-neu-xs mb-1">
            {{ nomerPo }}
          </span>
          <h1 class="text-xl font-extrabold text-ink tracking-tight">{{ namaKiriman }}</h1>
        </div>
        <span class="glass-pill font-mono">
          {{ presisi }} desimal
        </span>
      </div>

      <!-- Glassmorphic + Neumorphic Digital Scale HUD Display -->
      <div class="glass-hud px-6 py-7 mb-6 shadow-neu border border-white/90">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[11px] font-mono font-bold uppercase tracking-widest text-muted">
            {{ presisi === 2 ? 'Nilai Geser Saat Ini' : 'Nilai Terakhir Ditambahkan' }}
          </p>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-leaf/10 border border-leaf/20 text-leaf text-[10px] font-mono font-bold">
            <span class="w-1.5 h-1.5 rounded-full bg-leaf animate-pulse"></span>
            ACTIVE
          </span>
        </div>

        <div class="neu-inset py-4 px-6 rounded-2xl flex items-baseline justify-center gap-2">
          <span
            class="font-mono font-extrabold text-ink tracking-tight leading-none tabular-nums"
            style="font-size: clamp(3.2rem, 14vw, 4.8rem);"
          >
            {{ (presisi === 2 ? sliderVal : (lastAdded ?? 0)).toFixed(presisi) }}
          </span>
          <span class="font-mono text-xl font-bold text-muted">kg</span>
        </div>
      </div>

      <!-- Mode 1: Neumorphic Keypad Buttons -->
      <div v-if="presisi === 1" class="glass-card p-5 mb-6 shadow-neu border border-white/80">
        <div class="flex items-center justify-between mb-3">
          <p class="field-label !mb-0">Papan Tombol Cepat (4.1 – 6.0 kg)</p>
          <span class="text-[10px] text-muted font-mono">Tap untuk input</span>
        </div>
        <div class="grid grid-cols-5 gap-2.5">
          <button
            v-for="v in tombolCepat"
            :key="v"
            type="button"
            class="neu-keypad-btn"
            @click="tambahNilai(v)"
          >
            {{ v.toFixed(1) }}
          </button>
        </div>
      </div>

      <!-- Mode 2: Neumorphic Analog Precision Slider -->
      <div v-else class="glass-card p-6 mb-6 shadow-neu border border-white/80">
        <div class="flex items-center justify-between mb-3">
          <p class="field-label !mb-0">Slider Presisi 2 Desimal</p>
          <span class="font-mono font-bold text-amber-deep text-sm">{{ sliderVal.toFixed(2) }} kg</span>
        </div>

        <div class="neu-inset p-3 rounded-2xl mb-3">
          <input
            type="range"
            min="4.10"
            max="6.00"
            step="0.01"
            v-model.number="sliderVal"
            class="w-full cursor-pointer"
          />
          <div class="flex justify-between text-[11px] font-mono text-muted mt-2 px-1">
            <span>4.10 kg</span>
            <span>5.05 kg</span>
            <span>6.00 kg</span>
          </div>
        </div>

        <button class="btn-amber w-full py-3.5 text-sm font-bold tracking-wide" @click="tambahNilai(sliderVal)">
          + Tambahkan {{ sliderVal.toFixed(2) }} kg
        </button>
      </div>

      <!-- Live Statistics (Neumorphic Glass Tiles) -->
      <div class="grid grid-cols-4 gap-2.5 mb-5">
        <div class="glass-card-subtle py-3 px-2 text-center shadow-neu-xs border border-white/70">
          <p class="text-[10px] font-mono uppercase text-muted tracking-wider">Total</p>
          <p class="font-mono font-bold text-lg text-ink tabular-nums">{{ total }}</p>
        </div>
        <div class="glass-card-subtle py-3 px-2 text-center shadow-neu-xs border border-white/70">
          <p class="text-[10px] font-mono uppercase text-muted tracking-wider">Sum</p>
          <p class="font-mono font-bold text-lg text-ink tabular-nums">{{ jumlahSum.toFixed(2) }}</p>
        </div>
        <div class="glass-card-subtle py-3 px-2 text-center shadow-neu-xs border border-white/70">
          <p class="text-[10px] font-mono uppercase text-muted tracking-wider">Max</p>
          <p class="font-mono font-bold text-lg text-leaf tabular-nums">{{ nilaiMax.toFixed(2) }}</p>
        </div>
        <div class="glass-card-subtle py-3 px-2 text-center shadow-neu-xs border border-white/70">
          <p class="text-[10px] font-mono uppercase text-muted tracking-wider">Min</p>
          <p class="font-mono font-bold text-lg text-rust tabular-nums">{{ nilaiMin.toFixed(2) }}</p>
        </div>
      </div>

      <!-- Inputted Values List -->
      <div v-if="nilaiList.length" class="glass-card p-4 mb-5 shadow-neu-sm border border-white/80">
        <div class="flex items-center justify-between mb-2.5">
          <p class="field-label !mb-0">Daftar Data Masuk ({{ total }})</p>
          <span class="text-[11px] font-mono text-muted">Tap ✕ untuk hapus item</span>
        </div>
        <div class="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
          <span
            v-for="(v, i) in nilaiList"
            :key="i"
            class="stub font-mono text-xs font-semibold py-1 px-2.5 bg-white/80 shadow-neu-xs"
          >
            <span>#{{ i + 1 }}: <strong>{{ v.toFixed(presisi) }}</strong></span>
            <button
              type="button"
              class="text-muted hover:text-rust ml-1 transition cursor-pointer"
              title="Hapus nilai ini"
              @click="hapusIndex(i)"
            >
              ✕
            </button>
          </span>
        </div>
      </div>
      <p v-else class="text-xs text-muted mb-5 text-center py-2">
        Belum ada data masuk. Mulai dengan menekan tombol cepat atau slider di atas.
      </p>

      <p v-if="errorMsg" class="text-xs text-rust font-semibold bg-rose-50/80 p-2.5 rounded-lg border border-rose-200/60 mb-3">
        {{ errorMsg }}
      </p>

      <!-- Action Buttons (Undo & Reset) -->
      <div class="flex gap-3">
        <button class="btn-ghost flex-1 py-3 text-xs font-bold" :disabled="!nilaiList.length" @click="undoTerakhir">
          ↶ Undo Terakhir
        </button>
        <button class="btn-danger flex-1 py-3 text-xs font-bold" :disabled="!nilaiList.length" @click="resetSemua">
          ✕ Reset Sesi
        </button>
      </div>
    </div>

    <!-- Success View -->
    <div v-else class="glass-card p-8 text-center shadow-neu border border-white/90">
      <div class="w-16 h-16 rounded-2xl bg-leaf/15 text-leaf flex items-center justify-center mx-auto mb-4 text-3xl shadow-neu-sm border border-leaf/20">
        ✓
      </div>
      <h2 class="text-2xl font-extrabold text-ink mb-1">Berhasil Disimpan</h2>
      <p class="text-xs text-muted max-w-sm mx-auto mb-6 leading-relaxed">
        Sebanyak <strong class="text-ink">{{ total }} data</strong> dari
        <strong class="text-ink">{{ namaKiriman }}</strong> (PO: {{ nomerPo }}) telah tercatat ke sistem.
        Total akumulasi berat: <strong class="text-amber-deep font-mono">{{ jumlahSum.toFixed(2) }} kg</strong>.
      </p>
      <div class="flex gap-3 justify-center">
        <button class="btn-amber !px-6 !py-3 text-sm font-bold" @click="inputBaru">Input Baru</button>
        <button class="btn-ghost !px-6 !py-3 text-sm font-bold" @click="router.push({ name: 'riwayat' })">Lihat Riwayat</button>
      </div>
    </div>

    <!-- Floating Glassmorphic Bottom Save Bar -->
    <div v-if="!savedOk" class="fixed bottom-0 left-0 right-0 bg-white/75 backdrop-blur-2xl border-t border-white/80 p-4 z-20 shadow-[0_-8px_25px_rgba(163,177,198,0.25)]">
      <div class="max-w-lg mx-auto">
        <button
          type="button"
          class="btn-primary w-full py-4 text-sm font-bold tracking-wide rounded-neu-sm shadow-[4px_4px_16px_rgba(15,23,42,0.4),-3px_-3px_10px_rgba(255,255,255,0.9)]"
          :disabled="!nilaiList.length || saving"
          @click="simpanSelesai"
        >
          {{ saving ? 'Menyimpan ke Server…' : `Simpan & Selesai (${total} data)` }}
        </button>
      </div>
    </div>
  </div>
</template>
