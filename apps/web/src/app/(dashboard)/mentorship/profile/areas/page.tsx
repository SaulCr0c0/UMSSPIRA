import type { Metadata } from 'next';
import { MentorAreasPage } from '@/features/mentorship/components/mentor-areas-page';
import '@/features/mentorship/mentor-areas.css';

export const metadata: Metadata = {
  title: 'Áreas técnicas de especialidad · UMSSPIRA',
};

export default function MentorAreasRoute() {
  return <MentorAreasPage />;
}
