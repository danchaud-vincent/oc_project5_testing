import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionApiService } from './session-api.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Session } from '../interfaces/session.interface';
import { User } from 'src/app/interfaces/user.interface';

describe('SessionsService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'session1',
      description: 'a session',
      date: new Date('2025-12-01'),
      teacher_id: 1,
      users: [],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: 2,
      name: 'session2',
      description: 'another session',
      date: new Date('2025-12-24'),
      teacher_id: 4,
      users: [],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
  ];

  const user: User = {
    id: 1,
    email: 'user@test.com',
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
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('SessionsService Test Suite', () => {
    it('should return a list of session', (done) => {
      // ACT
      service.all().subscribe((response) => {
        expect(response).toEqual(mockSessions);
        done();
      });

      const req = httpMock.expectOne(`api/session`);

      // ASSERT
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);
    });

    it('should return a session', (done) => {
      // ARRANGE
      const sessionId: string = mockSessions[0].id!.toString();

      // ACT
      service.detail(sessionId).subscribe((response) => {
        expect(response).toEqual(mockSessions[0]);
        done();
      });

      const req = httpMock.expectOne(`api/session/${sessionId}`);

      // ASSERT
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions[0]);
    });

    it('should delete a session', (done) => {
      // ARRANGE
      const sessionId: string = mockSessions[0].id!.toString();

      // ACT
      service.delete(sessionId).subscribe((response) => {
        expect(response).toEqual('Session deleted');
        done();
      });

      const req = httpMock.expectOne(`api/session/${sessionId}`);

      // ASSERT
      expect(req.request.method).toBe('DELETE');
      req.flush('Session deleted');
    });

    it('should create a session', (done) => {
      // ARRANGE
      const mockNewSession: Session = {
        id: 3,
        name: 'session3',
        description: 'session',
        date: new Date('2025-02-02'),
        teacher_id: 5,
        users: [],
        createdAt: new Date('2025-02-01'),
        updatedAt: new Date('2025-02-01'),
      };

      // ACT
      service.create(mockNewSession).subscribe((response) => {
        expect(response).toEqual(mockNewSession);
        done();
      });

      const req = httpMock.expectOne(`api/session`);

      // ASSERT
      expect(req.request.method).toBe('POST');
      req.flush(mockNewSession);
    });

    it('should update a session', (done) => {
      // ARRANGE
      const mockToUpdateSession: Session = mockSessions[1];
      const sessionId: string = mockToUpdateSession.id!.toString();

      // ACT
      service.update(sessionId, mockToUpdateSession).subscribe((response) => {
        expect(response).toEqual(mockToUpdateSession);
        done();
      });

      const req = httpMock.expectOne(`api/session/${sessionId}`);

      // ASSERT
      expect(req.request.method).toBe('PUT');
      req.flush(mockToUpdateSession);
    });

    it('should register a user to a session', (done) => {
      // ARRANGE
      const sessionId: string = mockSessions[0].id!.toString();
      const userId: string = user.id.toString();

      // ACT
      service.participate(sessionId, userId).subscribe((response) => {
        expect(response).toEqual('User registered');
        done();
      });

      const req = httpMock.expectOne(
        `api/session/${sessionId}/participate/${userId}`
      );

      // ASSERT
      expect(req.request.method).toBe('POST');
      req.flush('User registered');
    });

    it('should unsubscribe a user of a session', (done) => {
      // ARRANGE
      const sessionId: string = mockSessions[0].id!.toString();
      const userId: string = user.id.toString();

      // ACT
      service.unParticipate(sessionId, userId).subscribe((response) => {
        expect(response).toEqual('User unsubscribed');
        done();
      });

      const req = httpMock.expectOne(
        `api/session/${sessionId}/participate/${userId}`
      );

      // ASSERT
      expect(req.request.method).toBe('DELETE');
      req.flush('User unsubscribed');
    });
  });
});
