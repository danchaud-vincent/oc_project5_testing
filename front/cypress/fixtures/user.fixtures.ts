import { User } from '../../src/app/interfaces/user.interface';

export const user: User = {
  id: 2,
  email: 'user@email.com',
  lastName: 'user',
  firstName: 'user',
  admin: false,
  password: 'user',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};
