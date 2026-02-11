import type { RubrikWawancara, RubrikWawancaraWithKriteria, Kriteria, RangeNilai, RubrikWawancaraFormInput, KriteriaFormInput } from '@/types/rubrik-wawancara';

// ============================================
// Helper Functions
// ============================================

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Mock Kriteria Data - Demo Majelis Tabligh Muhammadiyah
// ============================================

const createDefaultRanges = (): RangeNilai[] => [
  { id: 'r1', minNilai: 0, maxNilai: 40, kategori: 'Tidak Memenuhi', deskripsi: 'Calon mubaligh tidak memenuhi kriteria dasar' },
  { id: 'r2', minNilai: 41, maxNilai: 60, kategori: 'Cukup', deskripsi: 'Calon mubaligh memenuhi sebagian kriteria' },
  { id: 'r3', minNilai: 61, maxNilai: 80, kategori: 'Baik', deskripsi: 'Calon mubaligh memenuhi sebagian besar kriteria' },
  { id: 'r4', minNilai: 81, maxNilai: 100, kategori: 'Sangat Baik', deskripsi: 'Calon mubaligh memenuhi semua kriteria dengan baik' },
];

// Kriteria for Rubrik Aqidah dan Wawasan Kemuhammadiyahan
const kriteriaAqidah: Kriteria[] = [
  {
    id: 'krit-aqd-1',
    rubrikId: 'rubrik-1',
    nama: 'Pemahaman Aqidah Islam',
    deskripsi: 'Menilai pemahaman calon mubaligh tentang aqidah Islam sesuai Al-Quran dan Sunnah, termasuk rukun iman dan tauhid',
    bobot: 25,
    urutan: 1,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'krit-aqd-2',
    rubrikId: 'rubrik-1',
    nama: 'Wawasan Kemuhammadiyahan',
    deskripsi: 'Menilai pengetahuan tentang sejarah, ideologi, dan gerakan Muhammadiyah termasuk MKCH dan kepribadian Muhammadiyah',
    bobot: 25,
    urutan: 2,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'krit-aqd-3',
    rubrikId: 'rubrik-1',
    nama: 'Kemampuan Dakwah',
    deskripsi: 'Kemampuan menyampaikan pesan dakwah dengan jelas, menarik, dan sesuai dengan manhaj Muhammadiyah',
    bobot: 20,
    urutan: 3,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'krit-aqd-4',
    rubrikId: 'rubrik-1',
    nama: 'Pemahaman Fiqih Ibadah',
    deskripsi: 'Penguasaan fiqih ibadah sesuai keputusan Majelis Tarjih Muhammadiyah',
    bobot: 15,
    urutan: 4,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-10T11:00:00Z',
    updatedAt: '2026-01-10T11:00:00Z',
  },
  {
    id: 'krit-aqd-5',
    rubrikId: 'rubrik-1',
    nama: 'Akhlak dan Kepribadian',
    deskripsi: 'Menilai akhlak, sikap, dan kepribadian calon mubaligh sesuai tuntunan Islam dan nilai-nilai Muhammadiyah',
    bobot: 15,
    urutan: 5,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z',
  },
];

// Kriteria for Rubrik Baca Tulis Quran
const kriteriaBTQ: Kriteria[] = [
  {
    id: 'krit-btq-1',
    rubrikId: 'rubrik-2',
    nama: 'Kelancaran Membaca Al-Quran',
    deskripsi: 'Kemampuan membaca Al-Quran dengan lancar tanpa terbata-bata',
    bobot: 30,
    urutan: 1,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z',
  },
  {
    id: 'krit-btq-2',
    rubrikId: 'rubrik-2',
    nama: 'Ketepatan Tajwid',
    deskripsi: 'Penerapan hukum-hukum tajwid dengan benar saat membaca Al-Quran',
    bobot: 30,
    urutan: 2,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'krit-btq-3',
    rubrikId: 'rubrik-2',
    nama: 'Makhorijul Huruf',
    deskripsi: 'Ketepatan pengucapan huruf-huruf hijaiyah sesuai tempat keluarnya',
    bobot: 25,
    urutan: 3,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'krit-btq-4',
    rubrikId: 'rubrik-2',
    nama: 'Hafalan Surah',
    deskripsi: 'Kemampuan menghafal surah-surah pilihan dengan baik dan benar',
    bobot: 15,
    urutan: 4,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-12T11:00:00Z',
    updatedAt: '2026-01-12T11:00:00Z',
  },
];

// Kriteria for Rubrik Komitmen Organisasi
const kriteriaKomitmen: Kriteria[] = [
  {
    id: 'krit-kom-1',
    rubrikId: 'rubrik-3',
    nama: 'Komitmen Berorganisasi',
    deskripsi: 'Kesediaan dan komitmen untuk aktif dalam kegiatan organisasi Muhammadiyah',
    bobot: 35,
    urutan: 1,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'krit-kom-2',
    rubrikId: 'rubrik-3',
    nama: 'Pengalaman Dakwah',
    deskripsi: 'Pengalaman dalam kegiatan dakwah dan tabligh sebelumnya',
    bobot: 35,
    urutan: 2,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'krit-kom-3',
    rubrikId: 'rubrik-3',
    nama: 'Motivasi Menjadi Mubaligh',
    deskripsi: 'Motivasi dan niat yang tulus untuk menjadi mubaligh Muhammadiyah',
    bobot: 30,
    urutan: 3,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
];

// ============================================
// Mock Rubrik Wawancara Data
// ============================================

let mockRubriks: RubrikWawancaraWithKriteria[] = [
  {
    id: 'rubrik-1',
    nama: 'Rubrik Aqidah dan Wawasan Kemuhammadiyahan',
    deskripsi: 'Rubrik untuk menilai pemahaman calon mubaligh tentang aqidah Islam dan wawasan Kemuhammadiyahan. Mencakup tauhid, fiqih, dan ideologi Muhammadiyah.',
    isActive: true,
    kriteriaList: kriteriaAqidah,
    totalKriteria: kriteriaAqidah.length,
    totalBobot: kriteriaAqidah.reduce((sum, k) => sum + k.bobot, 0),
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'rubrik-2',
    nama: 'Rubrik Baca Tulis Quran',
    deskripsi: 'Rubrik untuk menilai kemampuan membaca Al-Quran calon mubaligh dengan tajwid yang benar dan makhorijul huruf yang tepat.',
    isActive: true,
    kriteriaList: kriteriaBTQ,
    totalKriteria: kriteriaBTQ.length,
    totalBobot: kriteriaBTQ.reduce((sum, k) => sum + k.bobot, 0),
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T11:00:00Z',
  },
  {
    id: 'rubrik-3',
    nama: 'Rubrik Komitmen dan Motivasi',
    deskripsi: 'Rubrik untuk menilai komitmen organisasi dan motivasi calon mubaligh dalam berdakwah.',
    isActive: false,
    kriteriaList: kriteriaKomitmen,
    totalKriteria: kriteriaKomitmen.length,
    totalBobot: kriteriaKomitmen.reduce((sum, k) => sum + k.bobot, 0),
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
];

// Store for all criteria (for independent operations)
let mockKriteria: Kriteria[] = [...kriteriaAqidah, ...kriteriaBTQ, ...kriteriaKomitmen];

// ============================================
// CRUD Functions for Rubrik
// ============================================

export function getRubriks(
  page: number = 0,
  size: number = 10,
): {
  content: RubrikWawancaraWithKriteria[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
} {
  const sorted = [...mockRubriks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const start = page * size;
  const end = start + size;
  const content = sorted.slice(start, end);

  return {
    content,
    totalElements: mockRubriks.length,
    totalPages: Math.ceil(mockRubriks.length / size),
    page,
    size,
  };
}

export function getRubrikById(id: string): RubrikWawancaraWithKriteria | undefined {
  return mockRubriks.find((r) => r.id === id);
}

export function createRubrik(input: RubrikWawancaraFormInput): RubrikWawancaraWithKriteria {
  const now = new Date().toISOString();
  const newRubrik: RubrikWawancaraWithKriteria = {
    id: generateId('rubrik'),
    nama: input.nama,
    deskripsi: input.deskripsi,
    isActive: input.isActive,
    kriteriaList: [],
    totalKriteria: 0,
    totalBobot: 0,
    createdAt: now,
    updatedAt: now,
  };
  mockRubriks.push(newRubrik);
  return newRubrik;
}

export function updateRubrik(id: string, input: RubrikWawancaraFormInput): RubrikWawancaraWithKriteria | undefined {
  const index = mockRubriks.findIndex((r) => r.id === id);
  if (index === -1) return undefined;

  const updated: RubrikWawancaraWithKriteria = {
    ...mockRubriks[index],
    nama: input.nama,
    deskripsi: input.deskripsi,
    isActive: input.isActive,
    updatedAt: new Date().toISOString(),
  };
  mockRubriks[index] = updated;
  return updated;
}

export function deleteRubrik(id: string): boolean {
  const index = mockRubriks.findIndex((r) => r.id === id);
  if (index === -1) return false;

  // Also delete all criteria for this rubrik
  mockKriteria = mockKriteria.filter((k) => k.rubrikId !== id);
  mockRubriks.splice(index, 1);
  return true;
}

export function toggleRubrikActive(id: string): RubrikWawancaraWithKriteria | undefined {
  const index = mockRubriks.findIndex((r) => r.id === id);
  if (index === -1) return undefined;

  mockRubriks[index] = {
    ...mockRubriks[index],
    isActive: !mockRubriks[index].isActive,
    updatedAt: new Date().toISOString(),
  };
  return mockRubriks[index];
}

// ============================================
// CRUD Functions for Kriteria
// ============================================

export function getKriteriaByRubrikId(
  rubrikId: string,
  page: number = 0,
  size: number = 10,
): {
  content: Kriteria[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
} {
  const filtered = mockKriteria.filter((k) => k.rubrikId === rubrikId).sort((a, b) => a.urutan - b.urutan);

  const start = page * size;
  const end = start + size;
  const content = filtered.slice(start, end);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page,
    size,
  };
}

export function getKriteriaById(id: string): Kriteria | undefined {
  return mockKriteria.find((k) => k.id === id);
}

export function createKriteria(rubrikId: string, input: KriteriaFormInput): Kriteria {
  const now = new Date().toISOString();
  const existingKriteria = mockKriteria.filter((k) => k.rubrikId === rubrikId);
  const maxUrutan = existingKriteria.length > 0 ? Math.max(...existingKriteria.map((k) => k.urutan)) : 0;

  const newKriteria: Kriteria = {
    id: generateId('krit'),
    rubrikId,
    nama: input.nama,
    deskripsi: input.deskripsi,
    bobot: input.bobot,
    urutan: maxUrutan + 1,
    metodePenilaian: input.metodePenilaian,
    createdAt: now,
    updatedAt: now,
  };

  mockKriteria.push(newKriteria);

  // Update rubrik totals
  updateRubrikTotals(rubrikId);

  return newKriteria;
}

export function updateKriteria(id: string, input: KriteriaFormInput): Kriteria | undefined {
  const index = mockKriteria.findIndex((k) => k.id === id);
  if (index === -1) return undefined;

  const rubrikId = mockKriteria[index].rubrikId;
  const updated: Kriteria = {
    ...mockKriteria[index],
    nama: input.nama,
    deskripsi: input.deskripsi,
    bobot: input.bobot,
    metodePenilaian: input.metodePenilaian,
    updatedAt: new Date().toISOString(),
  };
  mockKriteria[index] = updated;

  // Update rubrik totals
  updateRubrikTotals(rubrikId);

  return updated;
}

export function deleteKriteria(id: string): boolean {
  const index = mockKriteria.findIndex((k) => k.id === id);
  if (index === -1) return false;

  const rubrikId = mockKriteria[index].rubrikId;
  mockKriteria.splice(index, 1);

  // Update rubrik totals
  updateRubrikTotals(rubrikId);

  return true;
}

// Helper to update rubrik totals after kriteria changes
function updateRubrikTotals(rubrikId: string): void {
  const rubrikIndex = mockRubriks.findIndex((r) => r.id === rubrikId);
  if (rubrikIndex === -1) return;

  const kriteriaList = mockKriteria.filter((k) => k.rubrikId === rubrikId);

  mockRubriks[rubrikIndex] = {
    ...mockRubriks[rubrikIndex],
    kriteriaList,
    totalKriteria: kriteriaList.length,
    totalBobot: kriteriaList.reduce((sum, k) => sum + k.bobot, 0),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// Reset Function for Testing
// ============================================

export function resetMockRubriks(): void {
  mockRubriks = [
    {
      id: 'rubrik-1',
      nama: 'Rubrik Aqidah dan Wawasan Kemuhammadiyahan',
      deskripsi: 'Rubrik untuk menilai pemahaman calon mubaligh tentang aqidah Islam dan wawasan Kemuhammadiyahan.',
      isActive: true,
      kriteriaList: kriteriaAqidah,
      totalKriteria: kriteriaAqidah.length,
      totalBobot: kriteriaAqidah.reduce((sum, k) => sum + k.bobot, 0),
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-01-10T12:00:00Z',
    },
    {
      id: 'rubrik-2',
      nama: 'Rubrik Baca Tulis Quran',
      deskripsi: 'Rubrik untuk menilai kemampuan membaca Al-Quran calon mubaligh.',
      isActive: true,
      kriteriaList: kriteriaBTQ,
      totalKriteria: kriteriaBTQ.length,
      totalBobot: kriteriaBTQ.reduce((sum, k) => sum + k.bobot, 0),
      createdAt: '2026-01-12T08:00:00Z',
      updatedAt: '2026-01-12T11:00:00Z',
    },
    {
      id: 'rubrik-3',
      nama: 'Rubrik Komitmen dan Motivasi',
      deskripsi: 'Rubrik untuk menilai komitmen organisasi dan motivasi calon mubaligh.',
      isActive: false,
      kriteriaList: kriteriaKomitmen,
      totalKriteria: kriteriaKomitmen.length,
      totalBobot: kriteriaKomitmen.reduce((sum, k) => sum + k.bobot, 0),
      createdAt: '2026-01-15T08:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
    },
  ];

  mockKriteria = [...kriteriaAqidah, ...kriteriaBTQ, ...kriteriaKomitmen];
}

// Export mock data for direct access if needed
export { mockRubriks, mockKriteria };
