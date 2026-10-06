<script setup>
import { ref, onMounted } from 'vue'
import { MasterKirimanApi } from '../services/api'

const items = ref([])
const loading = ref(true)
const errorMsg = ref('')

const namaBaru = ref('')
const editId = ref(null)
const editNama = ref('')

async function muat() {
  loading.value = true
  try {
    const { data } = await MasterKirimanApi.list()
    items.value = data
  } catch (e) {
    errorMsg.value = 'Gagal memuat daftar kiriman.'
  } finally {
    loading.value = false
  }
}

async function tambah() {
  const nama = namaBaru.value.trim()
  if (!nama) return
  try {
    const { data } = await MasterKirimanApi.create(nama)
    items.value.push(data)
    namaBaru.value = ''
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || 'Gagal menambah (mungkin sudah ada).'
  }
}

function mulaiEdit(item) {
  editId.value = item.id
  editNama.value = item.nama_kiriman
}

async function simpanEdit(item) {
  try {
    const { data } = await MasterKirimanApi.update(item.id, editNama.value.trim())
    Object.assign(item, data)
    editId.value = null
  } catch (e) {
    errorMsg.value = 'Gagal menyimpan perubahan.'
  }
}

async function hapus(item) {
  if (!confirm(`Hapus kiriman "${item.nama_kiriman}"?`)) return
  try {
    await MasterKirimanApi.remove(item.id)
    items.value = items.value.filter((i) => i.id !== item.id)
  } catch (e) {
    alert('Gagal menghapus, mungkin masih dipakai di riwayat.')
  }
}

onMounted(muat)
</script>

<template>
  <div class="max-w-md mx-auto pb-12">
    <!-- Header -->
    <div class="mb-5">
      <span class="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider text-amber-deep bg-amber-400/15 border border-amber-400/30 shadow-neu-xs mb-2">
        MASTER DATA
      </span>
      <h1 class="text-2xl font-extrabold text-ink tracking-tight">Daftar Kiriman</h1>
      <p class="text-xs text-muted mt-1">Kelola daftar varian / jenis kiriman ayam untuk sampling.</p>
    </div>

    <!-- Add Item Bar -->
    <div class="glass-card p-3.5 mb-5 shadow-neu-sm border border-white/85 flex gap-2">
      <input
        v-model="namaBaru"
        class="field-input text-xs flex-1"
        placeholder="Nama kiriman baru…"
        @keyup.enter="tambah"
      />
      <button class="btn-amber whitespace-nowrap !px-4 text-xs font-bold" @click="tambah">
        + Tambah
      </button>
    </div>

    <p v-if="errorMsg" class="text-xs text-rust font-semibold bg-rose-50/80 p-3 rounded-lg border border-rose-200/60 mb-4">
      {{ errorMsg }}
    </p>

    <!-- Loading State -->
    <div v-if="loading" class="glass-card p-8 text-center text-muted shadow-neu-sm border border-white/80">
      <div class="inline-block w-6 h-6 border-2 border-amber border-t-transparent rounded-full animate-spin mb-2"></div>
      <p class="text-xs font-mono">Memuat daftar kiriman…</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!items.length" class="glass-card p-8 text-center text-muted shadow-neu-sm border border-white/80">
      <p class="text-sm font-semibold text-ink mb-1">Belum ada data kiriman</p>
      <p class="text-xs">Tambahkan jenis kiriman baru di atas untuk mulai.</p>
    </div>

    <!-- Items List -->
    <div v-else class="space-y-2.5">
      <div
        v-for="item in items"
        :key="item.id"
        class="glass-card p-3 sm:p-3.5 flex items-center gap-2 shadow-neu-xs border border-white/80"
      >
        <template v-if="editId === item.id">
          <input
            v-model="editNama"
            class="field-input text-xs flex-1 py-2"
            @keyup.enter="simpanEdit(item)"
          />
          <button class="btn-primary !px-3 !py-2 text-xs font-bold" @click="simpanEdit(item)">
            Simpan
          </button>
          <button class="btn-ghost !px-3 !py-2 text-xs font-bold" @click="editId = null">
            Batal
          </button>
        </template>
        <template v-else>
          <div class="w-2 h-2 rounded-full bg-amber shadow-sm"></div>
          <p class="flex-1 font-semibold text-ink text-sm truncate">{{ item.nama_kiriman }}</p>
          <button class="btn-ghost !px-3 !py-1.5 text-xs font-bold" @click="mulaiEdit(item)">
            Edit
          </button>
          <button class="btn-danger !px-3 !py-1.5 text-xs font-bold" @click="hapus(item)">
            Hapus
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
