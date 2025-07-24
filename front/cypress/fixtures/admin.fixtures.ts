import { User } from '../../src/app/interfaces/user.interface';

export const admin: User = {
  id: 1,
  email: 'admin@email.com',
  lastName: 'admin',
  firstName: 'admin',
  admin: true,
  password: 'admin',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};
