import { Router } from 'express'
import {
  masterKirimanData,
  riwayatInputData,
  getNextMasterId,
  getNextRiwayatId,
} from './db.js'

export const apiRouter = Router()

// --- Master Kiriman Endpoints ---

// GET /api/master-kiriman
apiRouter.get('/master-kiriman', (req, res) => {
  const sorted = [...masterKirimanData].sort((a, b) =>
    a.nama_kiriman.localeCompare(b.nama_kiriman, 'id')
  )
  res.json(sorted)
})

// POST /api/master-kiriman
apiRouter.post('/master-kiriman', (req, res) => {
  const { nama_kiriman } = req.body || {}
  const trimmed = typeof nama_kiriman === 'string' ? nama_kiriman.trim() : ''

  if (!trimmed) {
    return res.status(422).json({ message: 'Nama kiriman wajib diisi.' })
  }
  if (trimmed.length > 100) {
    return res.status(422).json({ message: 'Nama kiriman maksimal 100 karakter.' })
  }

  const exists = masterKirimanData.some(
    (item) => item.nama_kiriman.toLowerCase() === trimmed.toLowerCase()
  )
  if (exists) {
    return res.status(422).json({ message: 'Nama kiriman sudah ada.' })
  }

  const newItem = {
    id: getNextMasterId(),
    nama_kiriman: trimmed,
    created_at: new Date().toISOString(),
  }
  masterKirimanData.push(newItem)
  res.status(201).json(newItem)
})

// PUT /api/master-kiriman/:id
apiRouter.put('/master-kiriman/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const item = masterKirimanData.find((k) => k.id === id)

  if (!item) {
    return res.status(404).json({ message: 'Kiriman tidak ditemukan.' })
  }

  const { nama_kiriman } = req.body || {}
  const trimmed = typeof nama_kiriman === 'string' ? nama_kiriman.trim() : ''

  if (!trimmed) {
    return res.status(422).json({ message: 'Nama kiriman wajib diisi.' })
  }
  if (trimmed.length > 100) {
    return res.status(422).json({ message: 'Nama kiriman maksimal 100 karakter.' })
  }

  const duplicate = masterKirimanData.some(
    (k) => k.id !== id && k.nama_kiriman.toLowerCase() === trimmed.toLowerCase()
  )
  if (duplicate) {
    return res.status(422).json({ message: 'Nama kiriman sudah digunakan oleh data lain.' })
  }

  item.nama_kiriman = trimmed
  res.json(item)
})

// DELETE /api/master-kiriman/:id
apiRouter.delete('/master-kiriman/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const index = masterKirimanData.findIndex((k) => k.id === id)

  if (index === -1) {
    return res.status(404).json({ message: 'Kiriman tidak ditemukan.' })
  }

  masterKirimanData.splice(index, 1)
  res.json({ message: 'Kiriman dihapus' })
})

// --- Riwayat Input Endpoints ---

// GET /api/riwayat-input
apiRouter.get('/riwayat-input', (req, res) => {
  const { nama_kiriman, nomer_po, tanggal_dari, tanggal_sampai, page = 1 } = req.query
  const currentPage = Math.max(1, parseInt(page, 10) || 1)
  const perPage = 15

  let list = [...riwayatInputData]

  if (nama_kiriman && typeof nama_kiriman === 'string' && nama_kiriman.trim()) {
    const filterNama = nama_kiriman.trim().toLowerCase()
    list = list.filter((item) => item.nama_kiriman.toLowerCase() === filterNama)
  }

  if (nomer_po && typeof nomer_po === 'string' && nomer_po.trim()) {
    const filterPo = nomer_po.trim().toLowerCase()
    list = list.filter((item) => item.nomer_po.toLowerCase().includes(filterPo))
  }

  if (tanggal_dari && typeof tanggal_dari === 'string') {
    const fromDate = new Date(tanggal_dari)
    if (!isNaN(fromDate.getTime())) {
      list = list.filter((item) => new Date(item.created_at) >= fromDate)
    }
  }

  if (tanggal_sampai && typeof tanggal_sampai === 'string') {
    const toDate = new Date(`${tanggal_sampai}T23:59:59.999Z`)
    if (!isNaN(toDate.getTime())) {
      list = list.filter((item) => new Date(item.created_at) <= toDate)
    }
  }

  // Order descending by created_at
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const total = list.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const startIndex = (currentPage - 1) * perPage
  const pageItems = list.slice(startIndex, startIndex + perPage)

  res.json({
    data: pageItems,
    current_page: currentPage,
    last_page: lastPage,
    per_page: perPage,
    total: total,
    from: total > 0 ? startIndex + 1 : null,
    to: total > 0 ? Math.min(startIndex + perPage, total) : null,
  })
})

// GET /api/riwayat-input/:id
apiRouter.get('/riwayat-input/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const item = riwayatInputData.find((r) => r.id === id)

  if (!item) {
    return res.status(404).json({ message: 'Riwayat tidak ditemukan.' })
  }

  res.json(item)
})

// POST /api/riwayat-input
apiRouter.post('/riwayat-input', (req, res) => {
  const { nama_kiriman, nomer_po, nilai } = req.body || {}

  const trimmedNama = typeof nama_kiriman === 'string' ? nama_kiriman.trim() : ''
  const trimmedPo = typeof nomer_po === 'string' ? nomer_po.trim() : ''

  if (!trimmedNama) {
    return res.status(422).json({ message: 'Nama kiriman wajib diisi.' })
  }
  if (!trimmedPo) {
    return res.status(422).json({ message: 'Nomor PO wajib diisi.' })
  }
  if (!Array.isArray(nilai) || nilai.length === 0) {
    return res.status(422).json({ message: 'Data nilai timbangan minimal 1 item.' })
  }

  const parsedNilai = []
  for (const v of nilai) {
    const num = Number(v)
    if (isNaN(num) || num < 0) {
      return res.status(422).json({ message: 'Semua nilai timbangan harus berupa angka positif.' })
    }
    parsedNilai.push(Math.round(num * 100) / 100)
  }

  const totalData = parsedNilai.length
  const sum = Math.round(parsedNilai.reduce((acc, curr) => acc + curr, 0) * 100) / 100
  const maxVal = Math.round(Math.max(...parsedNilai) * 100) / 100
  const minVal = Math.round(Math.min(...parsedNilai) * 100) / 100

  const newItem = {
    id: getNextRiwayatId(),
    nama_kiriman: trimmedNama,
    nomer_po: trimmedPo,
    data_input: parsedNilai,
    total_data: totalData,
    rata_rata: sum, // sum of weights per application design
    nilai_max: maxVal,
    nilai_min: minVal,
    created_at: new Date().toISOString(),
  }

  riwayatInputData.push(newItem)
  res.status(201).json(newItem)
})

// DELETE /api/riwayat-input/:id
apiRouter.delete('/riwayat-input/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const index = riwayatInputData.findIndex((r) => r.id === id)

  if (index === -1) {
    return res.status(404).json({ message: 'Riwayat tidak ditemukan.' })
  }

  riwayatInputData.splice(index, 1)
  res.json({ message: 'Riwayat dihapus' })
})
