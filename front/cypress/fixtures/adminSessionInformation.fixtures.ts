import { SessionInformation } from '../../src/app/interfaces/sessionInformation.interface';

export const mockAdminSessionInfo: SessionInformation = {
  token: 'Bearer',
  type: 'token',
  id: 1,
  username: 'admin@email.com',
  firstName: 'admin',
  lastName: 'admin',
  admin: true,
};
