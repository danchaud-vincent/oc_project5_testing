import { SessionInformation } from '../../src/app/interfaces/sessionInformation.interface';

export const mockUserSessionInfo: SessionInformation = {
  token: 'Bearer',
  type: 'token',
  id: 2,
  username: 'user@email.com',
  firstName: 'user',
  lastName: 'user',
  admin: false,
};
