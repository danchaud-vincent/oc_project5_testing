import { HttpClientModule } from '@angular/common/http';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';

import { ListComponent } from './list.component';
import { Session } from '../../interfaces/session.interface';
import { SessionApiService } from '../../services/session-api.service';
import { of } from 'rxjs';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { getByDataTest } from 'src/test-utils/test-utils';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let sessionService: SessionService;
  let sessionApiService: SessionApiService;
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

  describe('Unit Test Suite', () => {
    const mockSessionService = {
      sessionInformation: {
        admin: true,
      },
    };

    const mockSessionApiService = {
      all: jest.fn().mockReturnValue(of(mockSessions)),
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ListComponent],
        imports: [HttpClientModule, MatCardModule, MatIconModule],
        providers: [
          { provide: SessionService, useValue: mockSessionService },
          { provide: SessionApiService, useValue: mockSessionApiService },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should return a list of session when component init', (done) => {
      component.sessions$.subscribe((response) => {
        // ASSERT
        expect(response).toEqual(mockSessions);
        done();
      });
    });

    it('should return session information when user() is called', () => {
      // ACT
      const result = component.user;
      // ASSERT
      expect(result).toEqual(mockSessionService.sessionInformation);
    });
  });

  describe('Integration Test Suite', () => {
    const mockAdminSessionService = {
      sessionInformation: {
        token: 'Bearer',
        type: 'token',
        id: 1,
        username: 'admin',
        firstName: 'admin',
        lastName: 'admin',
        admin: true,
      },
    };

    const mockUserSessionService = {
      sessionInformation: {
        token: 'Bearer',
        type: 'token',
        id: 2,
        username: 'user',
        firstName: 'user',
        lastName: 'user',
        admin: false,
      },
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ListComponent],
        imports: [
          HttpClientModule,
          MatCardModule,
          MatIconModule,
          HttpClientTestingModule,
        ],
        providers: [SessionService, SessionApiService],
      }).compileComponents();

      // inject service
      sessionService = TestBed.inject(SessionService);
      sessionApiService = TestBed.inject(SessionApiService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    describe('ListComponent as ADMIN', () => {
      it('should render a list of session in the DOM', fakeAsync(() => {
        // ARRANGE
        sessionService.sessionInformation =
          mockAdminSessionService.sessionInformation;

        // ACT CREATE COMPONENT (INIT)
        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const reqSession = httpMock.expectOne(`api/session`);

        // ASSERT HTTP REQUEST
        expect(reqSession.request.method).toBe('GET');

        // mock http response
        reqSession.flush(mockSessions);
        fixture.detectChanges();
        tick();

        // GET HTML ELEMENTS
        const sessionsEl = fixture.nativeElement.querySelectorAll(
          '[data-test="session"]'
        );

        // ASSERT SESSIONS LENGTH
        expect(sessionsEl.length).toBe(2);

        // GET FIRST SESSION
        const firstSessionEL = sessionsEl[0];
        const sessionTitleEl: HTMLElement = firstSessionEL.querySelector(
          "[data-test='sessionName']"
        );

        // ASSERT FIRST SESSION EL
        expect(sessionTitleEl.textContent).toBe(`${mockSessions[0].name}`);

        // GET BUTTONS
        const createBtnEl = getByDataTest(
          fixture,
          'create-btn'
        ) as HTMLButtonElement;
        const editBtnEl = getByDataTest(
          fixture,
          'edit-btn'
        ) as HTMLButtonElement;

        // ASSERT BUTTONS EXIST FOR AN ADMIN
        expect(createBtnEl).not.toBeNull();
        expect(editBtnEl).not.toBeNull();
      }));
    });

    describe('ListComponent as USER', () => {
      it('should not have access to Create button and Edit button', fakeAsync(() => {
        // ARRANGE
        sessionService.sessionInformation =
          mockUserSessionService.sessionInformation;

        // ACT CREATE COMPONENT (INIT)
        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const reqSession = httpMock.expectOne(`api/session`);

        // ASSERT HTTP REQUEST
        expect(reqSession.request.method).toBe('GET');

        // mock http response
        reqSession.flush(mockSessions);
        fixture.detectChanges();
        tick();

        // GET BUTTONS
        const createBtnEl = getByDataTest(
          fixture,
          'create-btn'
        ) as HTMLButtonElement;
        const editBtnEl = getByDataTest(
          fixture,
          'edit-btn'
        ) as HTMLButtonElement;

        // ASSERT BUTTONS EXIST FOR AN ADMIN
        expect(createBtnEl).toBeNull();
        expect(editBtnEl).toBeNull();
      }));
    });
  });
});
