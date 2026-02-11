import type { RubrikWawancaraWithKriteria, RubrikWawancaraFormInput, Kriteria, KriteriaFormInput, RangeNilai } from '@/types/rubrik-wawancara';

// ============================================
// Helper Functions
// ============================================

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Mock Kriteria Data
// ============================================

const createDefaultRanges = (): RangeNilai[] => [
  { id: 'r1', minNilai: 0, maxNilai: 40, kategori: 'Tidak Memenuhi', deskripsi: 'Kandidat tidak memenuhi kriteria dasar' },
  { id: 'r2', minNilai: 41, maxNilai: 60, kategori: 'Cukup', deskripsi: 'Kandidat memenuhi sebagian kriteria' },
  { id: 'r3', minNilai: 61, maxNilai: 80, kategori: 'Baik', deskripsi: 'Kandidat memenuhi sebagian besar kriteria' },
  { id: 'r4', minNilai: 81, maxNilai: 100, kategori: 'Sangat Baik', deskripsi: 'Kandidat memenuhi semua kriteria dengan baik' },
];

// Kriteria for Rubrik Teknis
const kriteriaTeknis: Kriteria[] = [
  {
    id: 'krit-tek-1',
    rubrikId: 'rubrik-1',
    nama: 'Kemampuan Pemrograman',
    deskripsi: 'Menilai kemampuan kandidat dalam menulis kode yang bersih, efisien, dan terstruktur',
    bobot: 30,
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
    id: 'krit-tek-2',
    rubrikId: 'rubrik-1',
    nama: 'Pemahaman Algoritma',
    deskripsi: 'Menilai pemahaman kandidat terhadap algoritma dan struktur data',
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
    id: 'krit-tek-3',
    rubrikId: 'rubrik-1',
    nama: 'Problem Solving',
    deskripsi: 'Kemampuan menganalisis masalah dan menemukan solusi yang tepat',
    bobot: 25,
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
    id: 'krit-tek-4',
    rubrikId: 'rubrik-1',
    nama: 'Pengetahuan Tools & Framework',
    deskripsi: 'Pemahaman terhadap tools, framework, dan best practices dalam development',
    bobot: 20,
    urutan: 4,
    metodePenilaian: {
      tipe: 'range',
      ranges: createDefaultRanges(),
      nilaiMaksimum: 100,
    },
    createdAt: '2026-01-10T11:00:00Z',
    updatedAt: '2026-01-10T11:00:00Z',
  },
];

// Kriteria for Rubrik HR
const kriteriaHR: Kriteria[] = [
  {
    id: 'krit-hr-1',
    rubrikId: 'rubrik-2',
    nama: 'Kemampuan Komunikasi',
    deskripsi: 'Kemampuan menyampaikan ide dengan jelas dan efektif',
    bobot: 25,
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
    id: 'krit-hr-2',
    rubrikId: 'rubrik-2',
    nama: 'Motivasi & Attitude',
    deskripsi: 'Menilai motivasi, sikap kerja, dan semangat kandidat',
    bobot: 25,
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
    id: 'krit-hr-3',
    rubrikId: 'rubrik-2',
    nama: 'Teamwork',
    deskripsi: 'Kemampuan bekerja dalam tim dan berkolaborasi',
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
    id: 'krit-hr-4',
    rubrikId: 'rubrik-2',
    nama: 'Cultural Fit',
    deskripsi: 'Kesesuaian dengan budaya dan nilai-nilai perusahaan',
    bobot: 25,
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

// Kriteria for Rubrik Managerial
const kriteriaManagerial: Kriteria[] = [
  {
    id: 'krit-mgr-1',
    rubrikId: 'rubrik-3',
    nama: 'Leadership',
    deskripsi: 'Kemampuan memimpin dan mengarahkan tim',
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
    id: 'krit-mgr-2',
    rubrikId: 'rubrik-3',
    nama: 'Strategic Thinking',
    deskripsi: 'Kemampuan berpikir strategis dan visioner',
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
    id: 'krit-mgr-3',
    rubrikId: 'rubrik-3',
    nama: 'Decision Making',
    deskripsi: 'Kemampuan mengambil keputusan yang tepat dan efektif',
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
    nama: 'Rubrik Wawancara Teknis',
    deskripsi: 'Rubrik untuk menilai kemampuan teknis kandidat dalam posisi developer. Mencakup kemampuan coding, pemahaman algoritma, dan problem solving.',
    isActive: true,
    kriteriaList: kriteriaTeknis,
    totalKriteria: kriteriaTeknis.length,
    totalBobot: kriteriaTeknis.reduce((sum, k) => sum + k.bobot, 0),
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T11:00:00Z',
  },
  {
    id: 'rubrik-2',
    nama: 'Rubrik Wawancara HR',
    deskripsi: 'Rubrik untuk penilaian aspek non-teknis kandidat termasuk soft skills, motivasi, dan kesesuaian budaya perusahaan.',
    isActive: true,
    kriteriaList: kriteriaHR,
    totalKriteria: kriteriaHR.length,
    totalBobot: kriteriaHR.reduce((sum, k) => sum + k.bobot, 0),
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T11:00:00Z',
  },
  {
    id: 'rubrik-3',
    nama: 'Rubrik Wawancara Managerial',
    deskripsi: 'Rubrik untuk menilai kemampuan manajerial kandidat untuk posisi leadership.',
    isActive: false,
    kriteriaList: kriteriaManagerial,
    totalKriteria: kriteriaManagerial.length,
    totalBobot: kriteriaManagerial.reduce((sum, k) => sum + k.bobot, 0),
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
];

// Store for all criteria (for independent operations)
let mockKriteria: Kriteria[] = [...kriteriaTeknis, ...kriteriaHR, ...kriteriaManagerial];

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

  const kriteriaForRubrik = mockKriteria.filter((k) => k.rubrikId === rubrikId);
  mockRubriks[rubrikIndex] = {
    ...mockRubriks[rubrikIndex],
    kriteriaList: kriteriaForRubrik,
    totalKriteria: kriteriaForRubrik.length,
    totalBobot: kriteriaForRubrik.reduce((sum, k) => sum + k.bobot, 0),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// Reset Function for Testing
// ============================================

export function resetMockRubriks(): void {
  mockKriteria = [...kriteriaTeknis, ...kriteriaHR, ...kriteriaManagerial];
  mockRubriks = [
    {
      id: 'rubrik-1',
      nama: 'Rubrik Wawancara Teknis',
      deskripsi: 'Rubrik untuk menilai kemampuan teknis kandidat dalam posisi developer. Mencakup kemampuan coding, pemahaman algoritma, dan problem solving.',
      isActive: true,
      kriteriaList: kriteriaTeknis,
      totalKriteria: kriteriaTeknis.length,
      totalBobot: kriteriaTeknis.reduce((sum, k) => sum + k.bobot, 0),
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-01-10T11:00:00Z',
    },
    {
      id: 'rubrik-2',
      nama: 'Rubrik Wawancara HR',
      deskripsi: 'Rubrik untuk penilaian aspek non-teknis kandidat termasuk soft skills, motivasi, dan kesesuaian budaya perusahaan.',
      isActive: true,
      kriteriaList: kriteriaHR,
      totalKriteria: kriteriaHR.length,
      totalBobot: kriteriaHR.reduce((sum, k) => sum + k.bobot, 0),
      createdAt: '2026-01-12T08:00:00Z',
      updatedAt: '2026-01-12T11:00:00Z',
    },
    {
      id: 'rubrik-3',
      nama: 'Rubrik Wawancara Managerial',
      deskripsi: 'Rubrik untuk menilai kemampuan manajerial kandidat untuk posisi leadership.',
      isActive: false,
      kriteriaList: kriteriaManagerial,
      totalKriteria: kriteriaManagerial.length,
      totalBobot: kriteriaManagerial.reduce((sum, k) => sum + k.bobot, 0),
      createdAt: '2026-01-15T08:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
    },
  ];
}

// Export mock data for direct access if needed
export { mockRubriks, mockKriteria };
