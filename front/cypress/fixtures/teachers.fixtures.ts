import { Teacher } from '../../src/app/interfaces/teacher.interface';

export const mockTeachers: Teacher[] = [
  {
    id: 1,
    lastName: 'name',
    firstName: 'teacher1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 2,
    lastName: 'name',
    firstName: 'teacher2',
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
];
