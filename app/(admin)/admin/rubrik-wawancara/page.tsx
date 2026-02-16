'use client';
import { useEffect } from 'react';
import { debugAuthCookies } from '@/helpers/cookieHelper';

export default function SomePage() {
  useEffect(() => {
    debugAuthCookies();
  }, []);

  return <div>Check console...</div>;
}
