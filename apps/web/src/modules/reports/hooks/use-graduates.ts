'use client';

import { useState } from 'react';
import { MOCK_GRADUATES_LIST, Graduate } from '../data/graduates.mock';

export function useGraduates() {
  const [data] = useState<Graduate[]>(MOCK_GRADUATES_LIST);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return {
    data,
    loading,
    error,
  };
}