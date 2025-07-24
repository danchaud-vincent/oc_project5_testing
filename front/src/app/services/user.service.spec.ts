import { HttpClientModule } from '@angular/common/http';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { UserService } from './user.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { User } from '../interfaces/user.interface';
import { of } from 'rxjs';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    email: 'user@email.com',
    lastName: 'user',
    firstName: 'user',
    admin: false,
    password: '1234',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('UserService Test suite', () => {
    it('should return a user when http called', (done) => {
      // ACT
      service.getById(mockUser.id.toString()).subscribe((response) => {
        expect(response).toBe(mockUser);
        done();
      });

      const req = httpMock.expectOne(`api/user/${mockUser.id}`);

      // ASSERT
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should delete a user', (done) => {
      //ACT
      service.delete(mockUser.id.toString()).subscribe((response) => {
        expect(response).toBe(mockUser);
        done();
      });

      const req = httpMock.expectOne(`api/user/${mockUser.id}`);

      // ASSERT
      expect(req.request.method).toBe('DELETE');
      req.flush(mockUser);
    });
  });
});
