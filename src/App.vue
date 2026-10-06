<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/', label: 'Mulai', name: 'start' },
  { to: '/riwayat', label: 'Riwayat', name: 'riwayat' },
  { to: '/master-kiriman', label: 'Kiriman', name: 'master-kiriman' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden bg-canvas">
    <!-- Ambient Glassmorphism Light Glow Orbs (Subtle diffused background lights) -->
    <div class="fixed top-[-100px] left-[-100px] w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -z-10" />
    <div class="fixed top-[30%] right-[-120px] w-[450px] h-[450px] bg-sky-400/15 rounded-full blur-3xl pointer-events-none -z-10" />
    <div class="fixed bottom-[-80px] left-[20%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

    <!-- Glassmorphism Sticky Top Header -->
    <header class="glass-header sticky top-0 z-20">
      <div class="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-amber font-mono font-bold text-sm flex items-center justify-center shadow-[3px_3px_8px_rgba(163,177,198,0.5),-3px_-3px_8px_rgba(255,255,255,0.9)] border border-slate-700/60">
            KA
          </div>
          <div class="leading-tight">
            <p class="font-mono font-bold text-sm tracking-tight text-ink">TIMBANGAN AYAM</p>
            <p class="text-[11px] text-muted">Sampling Pengiriman</p>
          </div>
        </div>

        <!-- Neumorphic Segmented Navigation Bar -->
        <nav class="flex items-center gap-1.5 p-1 bg-canvas-dark/50 backdrop-blur-md rounded-2xl shadow-neu-inset-sm border border-white/40">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="item.to"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
            :class="route.name === item.name
              ? 'bg-white/90 text-ink shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.95)] border border-white/90'
              : 'text-muted hover:text-ink'"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <div class="max-w-3xl mx-auto px-4 py-7">
        <RouterView />
      </div>
    </main>

    <footer class="text-center text-xs text-muted/80 py-8">
      Kiriman Ayam · Sistem Sampling Timbangan Digital
    </footer>
  </div>
</template>
