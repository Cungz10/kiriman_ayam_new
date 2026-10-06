// In-memory data store for Kiriman Ayam API
export const masterKirimanData = [
  { id: 1, nama_kiriman: 'Onigiri Cipete', created_at: new Date('2026-07-08T08:00:00Z').toISOString() },
  { id: 2, nama_kiriman: 'Ayam Utuh Broiler', created_at: new Date('2026-07-08T08:15:00Z').toISOString() },
  { id: 3, nama_kiriman: 'Fillet Dada Super', created_at: new Date('2026-07-08T08:30:00Z').toISOString() },
  { id: 4, nama_kiriman: 'Paha Pentung Resto', created_at: new Date('2026-07-08T08:45:00Z').toISOString() },
  { id: 5, nama_kiriman: 'Sayap Marinasi Gurih', created_at: new Date('2026-07-08T09:00:00Z').toISOString() },
]

export const riwayatInputData = [
  {
    id: 1,
    nama_kiriman: 'Onigiri Cipete',
    nomer_po: 'PO-2026-0708-01',
    data_input: [4.8, 5.1, 4.9, 5.2, 5.0, 4.7, 5.3, 5.0],
    total_data: 8,
    rata_rata: 40.0,
    nilai_max: 5.3,
    nilai_min: 4.7,
    created_at: new Date('2026-07-08T09:30:00Z').toISOString(),
  },
  {
    id: 2,
    nama_kiriman: 'Ayam Utuh Broiler',
    nomer_po: 'PO-2026-0708-02',
    data_input: [5.25, 5.4, 5.1, 5.35, 5.5],
    total_data: 5,
    rata_rata: 26.6,
    nilai_max: 5.5,
    nilai_min: 5.1,
    created_at: new Date('2026-07-08T11:15:00Z').toISOString(),
  },
  {
    id: 3,
    nama_kiriman: 'Fillet Dada Super',
    nomer_po: 'PO-2026-0707-03',
    data_input: [4.2, 4.4, 4.3, 4.6, 4.5],
    total_data: 5,
    rata_rata: 22.0,
    nilai_max: 4.6,
    nilai_min: 4.2,
    created_at: new Date('2026-07-07T14:20:00Z').toISOString(),
  },
]

let nextMasterId = 6
let nextRiwayatId = 4

export function getNextMasterId() {
  return nextMasterId++
}

export function getNextRiwayatId() {
  return nextRiwayatId++
}
