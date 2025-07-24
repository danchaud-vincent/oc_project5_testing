import { Session } from '../../src/app/features/sessions/interfaces/session.interface';

export const session: Session = {
  id: 1,
  name: 'a session',
  description: 'it is a session',
  date: new Date('2025-01-01'),
  teacher_id: 1,
  users: [1, 2],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};
