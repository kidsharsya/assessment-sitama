// ============================================
// Rubrik Wawancara Types
// ============================================

// ============================================
// Range Nilai (Score Range) Types
// ============================================
export interface RangeNilai {
  id: string;
  minNilai: number;
  maxNilai: number;
  kategori: string;
  deskripsi?: string;
}

// ============================================
// Metode Penilaian (Scoring Method) Types
// ============================================
export interface MetodePenilaian {
  tipe: 'range';
  ranges?: RangeNilai[];
  nilaiMaksimum: number;
}

// ============================================
// Kriteria (Criteria) Types
// ============================================
export interface Kriteria {
  id: string;
  rubrikId: string;
  nama: string;
  deskripsi: string;
  bobot: number;
  urutan: number;
  metodePenilaian: MetodePenilaian;
  createdAt: string;
  updatedAt: string;
}

export interface KriteriaFormInput {
  nama: string;
  deskripsi: string;
  bobot: number;
  metodePenilaian: MetodePenilaian;
}

// ============================================
// Rubrik Wawancara Types
// ============================================
export interface RubrikWawancara {
  id: string;
  nama: string;
  deskripsi: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RubrikWawancaraWithKriteria extends RubrikWawancara {
  kriteriaList: Kriteria[];
  totalKriteria: number;
  totalBobot: number;
}

export interface RubrikWawancaraFormInput {
  nama: string;
  deskripsi: string;
  isActive: boolean;
}

// ============================================
// Helper Transform Functions (Mock - No API needed)
// ============================================

/**
 * Transform form input to rubrik data (mock - returns same data)
 */
export function transformRubrikFormToApiRequest(data: RubrikWawancaraFormInput): RubrikWawancaraFormInput {
  return { ...data };
}

/**
 * Transform form input to kriteria data (mock - returns same data)
 */
export function transformKriteriaFormToApiRequest(data: KriteriaFormInput): KriteriaFormInput {
  return { ...data };
}

/**
 * Transform API criteria to Kriteria (mock - for compatibility)
 */
export function transformApiCriteriaToKriteria(criteria: Kriteria, index: number): Kriteria {
  return {
    ...criteria,
    urutan: index,
  };
}
