import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  const mockSessionInformation = {
    token: 'Bearer',
    type: 'token',
    id: 1,
    username: 'admin',
    firstName: 'admin',
    lastName: 'admin',
    admin: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log in and update session information', () => {
    // ACT
    service.logIn(mockSessionInformation);

    // ASSERT
    expect(service.sessionInformation).toBe(mockSessionInformation);
    expect(service.isLogged).toBe(true);

    service.$isLogged().subscribe((res) => {
      expect(res).toBe(true);
    });
  });

  it('should log out and update session information', () => {
    // ACT
    service.logOut();

    // ASSERT
    expect(service.sessionInformation).toBeUndefined();
    expect(service.isLogged).toBe(false);

    service.$isLogged().subscribe((res) => {
      expect(res).toBe(false);
    });
  });
});
