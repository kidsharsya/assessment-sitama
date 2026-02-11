import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/admin/kelola-sesi-ujian');
  return null;
}
