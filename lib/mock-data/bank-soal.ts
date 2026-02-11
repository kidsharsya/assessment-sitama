import type { Category, CategoryWithPackets, Packet, PacketWithQuestions, Question, QuestionOption, OptionLabel } from '@/types/bank-soal';

// ============================================
// Mock Questions - Demo Majelis Tabligh Muhammadiyah
// ============================================

const createMockOption = (questionId: string, label: OptionLabel, text: string): QuestionOption => ({
  id: `opt-${questionId}-${label}`,
  label,
  text,
});

const createMockQuestion = (id: string, packetId: string, questionText: string, options: string[], correctAnswer: OptionLabel, score: number, order: number, imagePath?: string): Question => ({
  id,
  packetId,
  questionText,
  imagePath,
  options: (['A', 'B', 'C', 'D', 'E'] as OptionLabel[]).map((label, index) => createMockOption(id, label, options[index] || '')),
  correctAnswer,
  score,
  order,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
});

// ============================================
// AIK (Al Islam Kemuhammadiyahan) Questions
// ============================================

// AIK Paket A Questions
const aikPaketAQuestions: Question[] = [
  createMockQuestion('q-aik-a-1', 'pkt-aik-a', 'Muhammadiyah didirikan oleh KH. Ahmad Dahlan pada tanggal...', ['18 November 1910', '18 November 1912', '18 Desember 1912', '8 Dzulhijjah 1330 H', '18 November 1920'], 'B', 5, 1),
  createMockQuestion('q-aik-a-2', 'pkt-aik-a', 'Muhammadiyah didirikan di kota...', ['Jakarta', 'Surabaya', 'Yogyakarta', 'Bandung', 'Solo'], 'C', 5, 2),
  createMockQuestion('q-aik-a-3', 'pkt-aik-a', 'Matan Keyakinan dan Cita-cita Hidup Muhammadiyah (MKCH) ditetapkan pada Muktamar ke...', ['35', '36', '37', '38', '39'], 'C', 5, 3),
  createMockQuestion('q-aik-a-4', 'pkt-aik-a', 'Gerakan Muhammadiyah berlandaskan pada...', ['Al-Quran dan Hadits', 'Ijtihad Ulama', 'Tradisi Leluhur', 'Fatwa MUI', 'Keputusan Muktamar'], 'A', 5, 4),
  createMockQuestion(
    'q-aik-a-5',
    'pkt-aik-a',
    'Kepanjangan dari HPT dalam Muhammadiyah adalah...',
    ['Himpunan Putusan Tarjih', 'Hasil Putusan Tarjih', 'Hukum Pengambilan Tarjih', 'Hasanah Putusan Tarjih', 'Himbauan Putusan Tarjih'],
    'A',
    5,
    5,
  ),
];

// AIK Paket B Questions
const aikPaketBQuestions: Question[] = [
  createMockQuestion('q-aik-b-1', 'pkt-aik-b', 'Majelis yang mengurusi penetapan hukum Islam dalam Muhammadiyah adalah...', ['Majelis Tabligh', 'Majelis Tarjih', 'Majelis Dikdasmen', 'Majelis Wakaf', 'Majelis Pustaka'], 'B', 5, 1),
  createMockQuestion('q-aik-b-2', 'pkt-aik-b', 'Amal usaha Muhammadiyah di bidang pendidikan meliputi...', ['TK sampai Perguruan Tinggi', 'SD sampai SMA saja', 'Pesantren saja', 'Madrasah saja', 'Perguruan Tinggi saja'], 'A', 5, 2),
  createMockQuestion('q-aik-b-3', 'pkt-aik-b', 'Organisasi otonom Muhammadiyah untuk pemuda adalah...', ['IMM', 'IPM', 'Pemuda Muhammadiyah', 'Tapak Suci', 'Hizbul Wathan'], 'C', 5, 3),
];

// AIK Paket C Questions
const aikPaketCQuestions: Question[] = [
  createMockQuestion('q-aik-c-1', 'pkt-aik-c', 'Motto gerakan dakwah Muhammadiyah adalah...', ['Fastabiqul Khairat', 'Baldatun Thayyibatun', 'Amar Maruf Nahi Munkar', 'Rahmatan Lil Alamin', 'Khaira Ummah'], 'C', 5, 1),
  createMockQuestion('q-aik-c-2', 'pkt-aik-c', 'Muktamar tertinggi Muhammadiyah dilaksanakan setiap...', ['3 tahun sekali', '4 tahun sekali', '5 tahun sekali', '6 tahun sekali', '10 tahun sekali'], 'C', 5, 2),
  createMockQuestion('q-aik-c-3', 'pkt-aik-c', 'Organisasi otonom Muhammadiyah untuk wanita adalah...', ['Nasyiatul Aisyiyah', 'Aisyiyah', 'Fatayat', 'Muslimat', 'Wanita Islam'], 'B', 5, 3),
];

// ============================================
// TBQ (Baca Tulis Quran) Questions
// ============================================

// TBQ Paket A Questions
const tbqPaketAQuestions: Question[] = [
  createMockQuestion('q-tbq-a-1', 'pkt-tbq-a', 'Hukum bacaan "Idgham Bighunnah" terjadi apabila nun mati atau tanwin bertemu dengan huruf...', ['ب ج د ق', 'ي ن م و', 'ا ه ع ح', 'خ ص ض ط', 'س ش ز ذ'], 'B', 5, 1),
  createMockQuestion('q-tbq-a-2', 'pkt-tbq-a', 'Jumlah huruf hijaiyah adalah...', ['26 huruf', '27 huruf', '28 huruf', '29 huruf', '30 huruf'], 'D', 5, 2),
  createMockQuestion('q-tbq-a-3', 'pkt-tbq-a', 'Tanda baca "Fathah" menghasilkan bunyi...', ['i', 'u', 'a', 'o', 'e'], 'C', 5, 3),
  createMockQuestion('q-tbq-a-4', 'pkt-tbq-a', 'Hukum bacaan "Ikhfa" berarti...', ['Jelas', 'Samar-samar', 'Memasukkan', 'Memantulkan', 'Menukar'], 'B', 5, 4),
  createMockQuestion(
    'q-tbq-a-5',
    'pkt-tbq-a',
    'Mad Wajib Muttashil adalah mad yang terjadi ketika...',
    ['Huruf mad bertemu hamzah dalam satu kata', 'Huruf mad bertemu hamzah di kata berbeda', 'Huruf mad di akhir ayat', 'Huruf mad bertemu sukun', 'Huruf mad di awal kata'],
    'A',
    5,
    5,
  ),
];

// TBQ Paket B Questions
const tbqPaketBQuestions: Question[] = [
  createMockQuestion('q-tbq-b-1', 'pkt-tbq-b', 'Huruf Qalqalah ada...', ['3 huruf', '4 huruf', '5 huruf', '6 huruf', '7 huruf'], 'C', 5, 1),
  createMockQuestion('q-tbq-b-2', 'pkt-tbq-b', 'Tanda waqaf "ج" berarti...', ['Wajib berhenti', 'Dilarang berhenti', 'Boleh berhenti atau terus', 'Lebih baik berhenti', 'Lebih baik terus'], 'C', 5, 2),
  createMockQuestion('q-tbq-b-3', 'pkt-tbq-b', 'Hukum nun mati bertemu dengan huruf "ب" adalah...', ['Izhar', 'Idgham', 'Iqlab', 'Ikhfa', 'Ghunnah'], 'C', 5, 3),
];

// TBQ Paket C Questions
const tbqPaketCQuestions: Question[] = [
  createMockQuestion('q-tbq-c-1', 'pkt-tbq-c', 'Al-Quran terdiri dari...', ['30 Juz', '114 Surah', '6236 Ayat', 'Semua benar', 'Semua salah'], 'D', 5, 1),
  createMockQuestion('q-tbq-c-2', 'pkt-tbq-c', 'Surah yang pertama turun adalah...', ['Al-Fatihah', 'Al-Alaq', 'Al-Baqarah', 'Al-Ikhlas', 'An-Nas'], 'B', 5, 2),
  createMockQuestion('q-tbq-c-3', 'pkt-tbq-c', 'Tajwid berasal dari kata "Jawwada" yang artinya...', ['Membaca', 'Memperbaiki', 'Memahami', 'Menghafal', 'Menyalin'], 'B', 5, 3),
];

// ============================================
// Mock Packets
// ============================================

const mockPackets: PacketWithQuestions[] = [
  // AIK Packets
  {
    id: 'pkt-aik-a',
    categoryId: 'cat-aik',
    name: 'AIK Paket A',
    code: 'A',
    isActive: true,
    questions: aikPaketAQuestions,
    totalQuestions: aikPaketAQuestions.length,
    totalScore: aikPaketAQuestions.reduce((sum, q) => sum + q.score, 0),
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'pkt-aik-b',
    categoryId: 'cat-aik',
    name: 'AIK Paket B',
    code: 'B',
    isActive: true,
    questions: aikPaketBQuestions,
    totalQuestions: aikPaketBQuestions.length,
    totalScore: aikPaketBQuestions.reduce((sum, q) => sum + q.score, 0),
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-14T09:00:00Z',
  },
  {
    id: 'pkt-aik-c',
    categoryId: 'cat-aik',
    name: 'AIK Paket C',
    code: 'C',
    isActive: true,
    questions: aikPaketCQuestions,
    totalQuestions: aikPaketCQuestions.length,
    totalScore: aikPaketCQuestions.reduce((sum, q) => sum + q.score, 0),
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  // TBQ Packets
  {
    id: 'pkt-tbq-a',
    categoryId: 'cat-tbq',
    name: 'TBQ Paket A',
    code: 'A',
    isActive: true,
    questions: tbqPaketAQuestions,
    totalQuestions: tbqPaketAQuestions.length,
    totalScore: tbqPaketAQuestions.reduce((sum, q) => sum + q.score, 0),
    createdAt: '2026-01-11T08:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'pkt-tbq-b',
    categoryId: 'cat-tbq',
    name: 'TBQ Paket B',
    code: 'B',
    isActive: true,
    questions: tbqPaketBQuestions,
    totalQuestions: tbqPaketBQuestions.length,
    totalScore: tbqPaketBQuestions.reduce((sum, q) => sum + q.score, 0),
    createdAt: '2026-01-11T08:00:00Z',
    updatedAt: '2026-01-11T08:00:00Z',
  },
  {
    id: 'pkt-tbq-c',
    categoryId: 'cat-tbq',
    name: 'TBQ Paket C',
    code: 'C',
    isActive: true,
    questions: tbqPaketCQuestions,
    totalQuestions: tbqPaketCQuestions.length,
    totalScore: tbqPaketCQuestions.reduce((sum, q) => sum + q.score, 0),
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-15T12:00:00Z',
  },
];

// ============================================
// Mock Categories
// ============================================

function getCategoryPackets(categoryId: string): PacketWithQuestions[] {
  return mockPackets.filter((p) => p.categoryId === categoryId);
}

function calculateCategoryStats(packets: PacketWithQuestions[]) {
  return {
    totalPackets: packets.length,
    totalQuestions: packets.reduce((sum, p) => sum + p.totalQuestions, 0),
    totalScore: packets.reduce((sum, p) => sum + p.totalScore, 0),
  };
}

export const mockCategories: CategoryWithPackets[] = [
  {
    id: 'cat-aik',
    name: 'Al Islam Kemuhammadiyahan',
    code: 'AIK',
    description: 'Tes untuk mengukur pemahaman tentang ajaran Islam dan nilai-nilai Kemuhammadiyahan, termasuk sejarah, organisasi, dan ideologi Muhammadiyah.',
    passingGrade: 65,
    isActive: true,
    packets: getCategoryPackets('cat-aik'),
    ...calculateCategoryStats(getCategoryPackets('cat-aik')),
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'cat-tbq',
    name: 'Baca Tulis Quran',
    code: 'TBQ',
    description: 'Tes untuk mengukur kemampuan membaca Al-Quran dengan tajwid yang benar, pemahaman ilmu tajwid, dan pengetahuan dasar tentang Al-Quran.',
    passingGrade: 70,
    isActive: true,
    packets: getCategoryPackets('cat-tbq'),
    ...calculateCategoryStats(getCategoryPackets('cat-tbq')),
    createdAt: '2026-01-02T08:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
  },
];

// ============================================
// Helper Functions for CRUD Operations (Mock)
// ============================================

let categoriesData = [...mockCategories];
let packetsData = [...mockPackets];
let questionsData = [...aikPaketAQuestions, ...aikPaketBQuestions, ...aikPaketCQuestions, ...tbqPaketAQuestions, ...tbqPaketBQuestions, ...tbqPaketCQuestions];

// Generate unique ID
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Categories CRUD
export const getCategories = (): CategoryWithPackets[] => {
  return categoriesData.map((cat) => {
    const packets = packetsData.filter((p) => p.categoryId === cat.id);
    const stats = calculateCategoryStats(packets);
    return { ...cat, packets, ...stats };
  });
};

export const getCategoryById = (id: string): CategoryWithPackets | undefined => {
  const cat = categoriesData.find((c) => c.id === id);
  if (!cat) return undefined;

  const packets = packetsData.filter((p) => p.categoryId === id);
  const stats = calculateCategoryStats(packets);
  return { ...cat, packets, ...stats };
};

export const createCategory = (input: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): CategoryWithPackets => {
  const newCategory: CategoryWithPackets = {
    ...input,
    id: generateId('cat'),
    packets: [],
    totalPackets: 0,
    totalQuestions: 0,
    totalScore: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  categoriesData.push(newCategory);
  return newCategory;
};

export const updateCategory = (id: string, input: Partial<Category>): CategoryWithPackets | undefined => {
  const index = categoriesData.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  categoriesData[index] = {
    ...categoriesData[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  return getCategoryById(id);
};

export const deleteCategory = (id: string): boolean => {
  const index = categoriesData.findIndex((c) => c.id === id);
  if (index === -1) return false;

  // Also delete related packets and questions
  const categoryPackets = packetsData.filter((p) => p.categoryId === id);
  categoryPackets.forEach((p) => {
    questionsData = questionsData.filter((q) => q.packetId !== p.id);
  });
  packetsData = packetsData.filter((p) => p.categoryId !== id);
  categoriesData.splice(index, 1);

  return true;
};

// Packets CRUD
export const getPacketsByCategoryId = (categoryId: string): PacketWithQuestions[] => {
  return packetsData
    .filter((p) => p.categoryId === categoryId)
    .map((p) => {
      const questions = questionsData.filter((q) => q.packetId === p.id);
      return {
        ...p,
        questions,
        totalQuestions: questions.length,
        totalScore: questions.reduce((sum, q) => sum + q.score, 0),
      };
    });
};

export const getPacketById = (id: string): PacketWithQuestions | undefined => {
  const packet = packetsData.find((p) => p.id === id);
  if (!packet) return undefined;

  const questions = questionsData.filter((q) => q.packetId === id);
  return {
    ...packet,
    questions,
    totalQuestions: questions.length,
    totalScore: questions.reduce((sum, q) => sum + q.score, 0),
  };
};

export const createPacket = (input: Omit<Packet, 'id' | 'createdAt' | 'updatedAt'>): PacketWithQuestions => {
  const newPacket: PacketWithQuestions = {
    ...input,
    id: generateId('pkt'),
    questions: [],
    totalQuestions: 0,
    totalScore: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  packetsData.push(newPacket);
  return newPacket;
};

export const updatePacket = (id: string, input: Partial<Packet>): PacketWithQuestions | undefined => {
  const index = packetsData.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  packetsData[index] = {
    ...packetsData[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  return getPacketById(id);
};

export const deletePacket = (id: string): boolean => {
  const index = packetsData.findIndex((p) => p.id === id);
  if (index === -1) return false;

  // Also delete related questions
  questionsData = questionsData.filter((q) => q.packetId !== id);
  packetsData.splice(index, 1);

  return true;
};

// Questions CRUD
export const getQuestionsByPacketId = (packetId: string): Question[] => {
  return questionsData.filter((q) => q.packetId === packetId).sort((a, b) => a.order - b.order);
};

export const getQuestionById = (id: string): Question | undefined => {
  return questionsData.find((q) => q.id === id);
};

export const createQuestion = (input: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Question => {
  const newQuestion: Question = {
    ...input,
    id: generateId('q'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  questionsData.push(newQuestion);
  return newQuestion;
};

export const updateQuestion = (id: string, input: Partial<Question>): Question | undefined => {
  const index = questionsData.findIndex((q) => q.id === id);
  if (index === -1) return undefined;

  questionsData[index] = {
    ...questionsData[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  return questionsData[index];
};

export const deleteQuestion = (id: string): boolean => {
  const index = questionsData.findIndex((q) => q.id === id);
  if (index === -1) return false;

  questionsData.splice(index, 1);
  return true;
};

// Reset data (untuk testing)
export const resetMockData = () => {
  categoriesData = [...mockCategories];
  packetsData = [...mockPackets];
  questionsData = [...aikPaketAQuestions, ...aikPaketBQuestions, ...aikPaketCQuestions, ...tbqPaketAQuestions, ...tbqPaketBQuestions, ...tbqPaketCQuestions];
};
