import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Form Penilaian Wawancara - Sistem Sitama',
  description: 'Form penilaian wawancara untuk interviewer',
};

// ============================================
// Wawancara Layout - Layout khusus untuk interviewer
// ============================================

export default function WawancaraLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
