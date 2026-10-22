export interface MentorshipRequest {
  id: string;
  mentorId: string;
  requesterId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  message: string | null;
  status: 'PENDIENTE';
  createdAt: Date | null;
}
