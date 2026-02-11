import type { Category, CategoryWithPackets, Packet, PacketWithQuestions, Question, QuestionOption, OptionLabel } from '@/types/bank-soal';

// ============================================
// Mock Questions
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
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
});

// TWK Paket A Questions
const twkPaketAQuestions: Question[] = [
  createMockQuestion('q-twk-a-1', 'pkt-twk-a', 'Pancasila sebagai dasar negara Indonesia tercantum dalam pembukaan UUD 1945 alinea ke...', ['Pertama', 'Kedua', 'Ketiga', 'Keempat', 'Kelima'], 'D', 5, 1),
  createMockQuestion('q-twk-a-2', 'pkt-twk-a', 'Hari kemerdekaan Indonesia diperingati setiap tanggal...', ['15 Agustus', '16 Agustus', '17 Agustus', '18 Agustus', '19 Agustus'], 'C', 5, 2),
  createMockQuestion('q-twk-a-3', 'pkt-twk-a', 'Siapakah proklamator kemerdekaan Indonesia?', ['Soekarno dan Hatta', 'Soekarno dan Sjahrir', 'Hatta dan Tan Malaka', 'Soekarno dan Soepomo', 'Hatta dan Ahmad Subardjo'], 'A', 5, 3),
  createMockQuestion('q-twk-a-4', 'pkt-twk-a', 'Lembaga negara yang bertugas mengawasi keuangan negara adalah...', ['DPR', 'MPR', 'BPK', 'MA', 'KPK'], 'C', 5, 4),
  createMockQuestion('q-twk-a-5', 'pkt-twk-a', 'Semboyan Bhinneka Tunggal Ika berasal dari kitab...', ['Negarakertagama', 'Sutasoma', 'Pararaton', 'Arjunawiwaha', 'Bharatayudha'], 'B', 5, 5),
];

// TWK Paket B Questions
const twkPaketBQuestions: Question[] = [
  createMockQuestion('q-twk-b-1', 'pkt-twk-b', 'Ideologi Pancasila pertama kali dikemukakan oleh Soekarno pada tanggal...', ['1 Mei 1945', '1 Juni 1945', '17 Agustus 1945', '18 Agustus 1945', '22 Juni 1945'], 'B', 5, 1),
  createMockQuestion('q-twk-b-2', 'pkt-twk-b', 'UUD 1945 telah mengalami amandemen sebanyak...', ['2 kali', '3 kali', '4 kali', '5 kali', '6 kali'], 'C', 5, 2),
  createMockQuestion('q-twk-b-3', 'pkt-twk-b', 'Wilayah Indonesia terletak di antara dua benua, yaitu...', ['Asia dan Afrika', 'Asia dan Australia', 'Asia dan Eropa', 'Australia dan Afrika', 'Eropa dan Australia'], 'B', 5, 3),
];

// TIU Paket A Questions
const tiuPaketAQuestions: Question[] = [
  createMockQuestion('q-tiu-a-1', 'pkt-tiu-a', 'Jika x + 5 = 12, maka nilai x adalah...', ['5', '6', '7', '8', '9'], 'C', 5, 1),
  createMockQuestion('q-tiu-a-2', 'pkt-tiu-a', 'Sinonim dari kata "ELABORASI" adalah...', ['Pengurangan', 'Penguraian', 'Penggabungan', 'Penyederhanaan', 'Pengulangan'], 'B', 5, 2),
  createMockQuestion('q-tiu-a-3', 'pkt-tiu-a', 'Lawan kata dari "HETEROGEN" adalah...', ['Beragam', 'Homogen', 'Kompleks', 'Abstrak', 'Konkret'], 'B', 5, 3),
  createMockQuestion('q-tiu-a-4', 'pkt-tiu-a', '25% dari 400 adalah...', ['75', '80', '100', '125', '150'], 'C', 5, 4),
];

// TKP Paket A Questions
const tkpPaketAQuestions: Question[] = [
  createMockQuestion(
    'q-tkp-a-1',
    'pkt-tkp-a',
    'Ketika Anda mendapat tugas yang sangat banyak dari atasan, sikap Anda adalah...',
    ['Mengeluh kepada rekan kerja', 'Menolak tugas tersebut', 'Mengerjakan dengan prioritas yang tepat', 'Meminta rekan kerja mengerjakan', 'Menunda-nunda pekerjaan'],
    'C',
    5,
    1,
  ),
  createMockQuestion(
    'q-tkp-a-2',
    'pkt-tkp-a',
    'Jika Anda melihat rekan kerja melakukan kesalahan, Anda akan...',
    ['Membiarkan saja', 'Melaporkan ke atasan langsung', 'Menegur dengan baik secara pribadi', 'Menyebarkan ke rekan lain', 'Membahas di grup chat'],
    'C',
    5,
    2,
  ),
];

// ============================================
// Mock Packets
// ============================================

const mockPackets: PacketWithQuestions[] = [
  // TWK Packets
  {
    id: 'pkt-twk-a',
    categoryId: 'cat-twk',
    name: 'TWK Paket A',
    code: 'A',
    isActive: true,
    questions: twkPaketAQuestions,
    totalQuestions: twkPaketAQuestions.length,
    totalScore: twkPaketAQuestions.reduce((sum, q) => sum + q.score, 0),
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'pkt-twk-b',
    categoryId: 'cat-twk',
    name: 'TWK Paket B',
    code: 'B',
    isActive: true,
    questions: twkPaketBQuestions,
    totalQuestions: twkPaketBQuestions.length,
    totalScore: twkPaketBQuestions.reduce((sum, q) => sum + q.score, 0),
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-14T09:00:00Z',
  },
  {
    id: 'pkt-twk-c',
    categoryId: 'cat-twk',
    name: 'TWK Paket C',
    code: 'C',
    isActive: false,
    questions: [],
    totalQuestions: 0,
    totalScore: 0,
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z',
  },
  // TIU Packets
  {
    id: 'pkt-tiu-a',
    categoryId: 'cat-tiu',
    name: 'TIU Paket A',
    code: 'A',
    isActive: true,
    questions: tiuPaketAQuestions,
    totalQuestions: tiuPaketAQuestions.length,
    totalScore: tiuPaketAQuestions.reduce((sum, q) => sum + q.score, 0),
    createdAt: '2025-01-11T08:00:00Z',
    updatedAt: '2025-01-15T11:00:00Z',
  },
  {
    id: 'pkt-tiu-b',
    categoryId: 'cat-tiu',
    name: 'TIU Paket B',
    code: 'B',
    isActive: true,
    questions: [],
    totalQuestions: 0,
    totalScore: 0,
    createdAt: '2025-01-11T08:00:00Z',
    updatedAt: '2025-01-11T08:00:00Z',
  },
  // TKP Packets
  {
    id: 'pkt-tkp-a',
    categoryId: 'cat-tkp',
    name: 'TKP Paket A',
    code: 'A',
    isActive: true,
    questions: tkpPaketAQuestions,
    totalQuestions: tkpPaketAQuestions.length,
    totalScore: tkpPaketAQuestions.reduce((sum, q) => sum + q.score, 0),
    createdAt: '2025-01-12T08:00:00Z',
    updatedAt: '2025-01-15T12:00:00Z',
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
    id: 'cat-twk',
    name: 'Tes Wawasan Kebangsaan',
    code: 'TWK',
    description: 'Tes untuk mengukur penguasaan pengetahuan dan kemampuan mengimplementasikan nilai-nilai 4 pilar kebangsaan Indonesia.',
    passingGrade: 65,
    isActive: true,
    packets: getCategoryPackets('cat-twk'),
    ...calculateCategoryStats(getCategoryPackets('cat-twk')),
    createdAt: '2025-01-01T08:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'cat-tiu',
    name: 'Tes Intelegensi Umum',
    code: 'TIU',
    description: 'Tes untuk mengukur kemampuan verbal, numerik, dan figural dalam menyelesaikan masalah.',
    passingGrade: 80,
    isActive: true,
    packets: getCategoryPackets('cat-tiu'),
    ...calculateCategoryStats(getCategoryPackets('cat-tiu')),
    createdAt: '2025-01-02T08:00:00Z',
    updatedAt: '2025-01-15T11:00:00Z',
  },
  {
    id: 'cat-tkp',
    name: 'Tes Karakteristik Pribadi',
    code: 'TKP',
    description: 'Tes untuk mengukur karakteristik pribadi peserta dalam menyikapi berbagai situasi kerja.',
    passingGrade: 143,
    isActive: true,
    packets: getCategoryPackets('cat-tkp'),
    ...calculateCategoryStats(getCategoryPackets('cat-tkp')),
    createdAt: '2025-01-03T08:00:00Z',
    updatedAt: '2025-01-15T12:00:00Z',
  },
  {
    id: 'cat-skd',
    name: 'Seleksi Kompetensi Dasar',
    code: 'SKD',
    description: 'Tes gabungan TWK, TIU, dan TKP untuk seleksi kompetensi dasar.',
    passingGrade: 301,
    isActive: false,
    packets: [],
    totalPackets: 0,
    totalQuestions: 0,
    totalScore: 0,
    createdAt: '2025-01-04T08:00:00Z',
    updatedAt: '2025-01-04T08:00:00Z',
  },
];

// ============================================
// Helper Functions for CRUD Operations (Mock)
// ============================================

let categoriesData = [...mockCategories];
let packetsData = [...mockPackets];
let questionsData = [...twkPaketAQuestions, ...twkPaketBQuestions, ...tiuPaketAQuestions, ...tkpPaketAQuestions];

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
  questionsData = [...twkPaketAQuestions, ...twkPaketBQuestions, ...tiuPaketAQuestions, ...tkpPaketAQuestions];
};
