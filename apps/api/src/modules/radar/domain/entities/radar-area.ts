export const RADAR_AREA_IDS = {
  'software-development': '60000000-0000-4000-8000-000000000003',
  'cloud-devops': '60000000-0000-4000-8000-000000000006',
  'data-ai': '60000000-0000-4000-8000-000000000007',
  'quality-assurance': '60000000-0000-4000-8000-000000000008',
  'cybersecurity-networks': '60000000-0000-4000-8000-000000000009',
  'it-management': '60000000-0000-4000-8000-000000000010',
} as const;

export type RadarArea = keyof typeof RADAR_AREA_IDS;
