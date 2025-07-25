import { HttpClientModule } from '@angular/common/http';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from '../../../../services/session.service';

import { DetailComponent } from './detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { of } from 'rxjs';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { getByDataTest } from 'src/test-utils/test-utils';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ListComponent } from '../list/list.component';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let sessionService: SessionService;
  let sessionApiService: SessionApiService;
  let teacherService: TeacherService;
  let router: Router;
  let location: Location;
  let matSnackBar: MatSnackBar;
  let httpMock: HttpTestingController;

  const mockSession = {
    id: 1,
    name: 'session1',
    description: 'a session',
    date: new Date('2025-12-01'),
    teacher_id: 1,
    users: [1, 2, 3],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const sessionId: string = mockSession.id.toString();

  const mockNoUsersSession = {
    id: 1,
    name: 'session1',
    description: 'a session',
    date: new Date('2025-12-01'),
    teacher_id: 1,
    users: [],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const sessionNoUsersId = mockNoUsersSession.id;

  const mockTeacher = {
    id: 1,
    lastName: 'teacher',
    firstName: 'teacher',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

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

  const adminId: string =
    mockAdminSessionService.sessionInformation.id.toString();

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

  const userId: string =
    mockUserSessionService.sessionInformation.id.toString();

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue(sessionId),
      },
    },
  };

  const testRoutes = [{ path: 'sessions', component: ListComponent }];

  describe('Unit Test Suite', () => {
    const mockSessionApiService = {
      delete: jest.fn().mockReturnValue(of(true)),
      detail: jest.fn().mockReturnValue(of(mockSession)),
      participate: jest.fn().mockReturnValue(of(true)),
      unParticipate: jest.fn().mockReturnValue(of(true)),
    };
    const mockTeacherService = {
      detail: jest.fn().mockReturnValue(of(mockTeacher)),
    };

    const mockMatSnackBar = {
      open: jest.fn(),
    };

    describe('Unit test as USER', () => {
      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [
            RouterTestingModule,
            HttpClientModule,
            MatSnackBarModule,
            ReactiveFormsModule,
          ],
          declarations: [DetailComponent],
          providers: [
            { provide: SessionService, useValue: mockUserSessionService },
            { provide: SessionApiService, useValue: mockSessionApiService },
            { provide: TeacherService, useValue: mockTeacherService },
            { provide: MatSnackBar, useValue: mockMatSnackBar },
            { provide: ActivatedRoute, useValue: mockActivatedRoute },
          ],
        }).compileComponents();

        // inject
        router = TestBed.inject(Router);

        fixture = TestBed.createComponent(DetailComponent);
        component = fixture.componentInstance;
      });

      it('should create the component', () => {
        // ACT
        fixture.detectChanges();
        // ASSERT
        expect(component).toBeTruthy();
      });

      it('should load session and teacher info on init', () => {
        // ARRANGE
        const isParticipate: boolean = mockSession.users.some(
          (u) => u === mockUserSessionService.sessionInformation.id
        );

        // ACT
        fixture.detectChanges();

        // ASSERT
        expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith(
          'id'
        );
        expect(component.isAdmin).toBe(
          mockUserSessionService.sessionInformation.admin
        );
        expect(component.sessionId).toBe(sessionId);
        expect(component.userId).toBe(userId);
        expect(mockSessionApiService.detail).toHaveBeenCalledWith(sessionId);
        expect(mockTeacherService.detail).toHaveBeenCalledWith(
          mockSession.teacher_id.toString()
        );
        expect(component.session).toEqual(mockSession);
        expect(component.isParticipate).toBe(isParticipate);
      });

      it('should navigate back in history when back() is called', () => {
        // ARRANGE
        const spyWindowBack = jest.spyOn(window.history, 'back');

        // ACT
        component.back();

        // ASSERT
        expect(spyWindowBack).toHaveBeenCalled();
      });

      it('should call participate() and send correct params for user', () => {
        // ACT
        fixture.detectChanges();
        component.participate();

        // ASSERT
        expect(mockSessionApiService.participate).toHaveBeenCalledWith(
          sessionId,
          userId
        );
      });

      it('should call unParticipate() and send correct params for user', () => {
        // ACT
        fixture.detectChanges();
        component.unParticipate();

        // ASSERT
        expect(mockSessionApiService.unParticipate).toHaveBeenCalledWith(
          sessionId,
          userId
        );
      });
    });

    describe('Unit Test as ADMIN', () => {
      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [
            RouterTestingModule,
            HttpClientModule,
            MatSnackBarModule,
            ReactiveFormsModule,
          ],
          declarations: [DetailComponent],
          providers: [
            { provide: SessionService, useValue: mockAdminSessionService },
            { provide: SessionApiService, useValue: mockSessionApiService },
            { provide: TeacherService, useValue: mockTeacherService },
            { provide: MatSnackBar, useValue: mockMatSnackBar },
            { provide: ActivatedRoute, useValue: mockActivatedRoute },
          ],
        }).compileComponents();

        // inject
        router = TestBed.inject(Router);

        fixture = TestBed.createComponent(DetailComponent);
        component = fixture.componentInstance;
      });

      it('should show confirmation and navigate after admin deletes a session', () => {
        // ARRANGE
        const spyNavigate = jest.spyOn(router, 'navigate');

        // ACT
        fixture.detectChanges();
        component.delete();

        // ASSERT
        expect(mockMatSnackBar.open).toHaveBeenCalledWith(
          'Session deleted !',
          'Close',
          { duration: 3000 }
        );
        expect(spyNavigate).toHaveBeenCalledWith(['sessions']);
      });
    });
  });

  describe('Integration Test Suite', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes(testRoutes),
          HttpClientModule,
          MatSnackBarModule,
          ReactiveFormsModule,
          HttpClientTestingModule,
          BrowserAnimationsModule,
        ],
        declarations: [DetailComponent],
        providers: [
          SessionService,
          SessionApiService,
          TeacherService,
          MatSnackBar,
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
        ],
      }).compileComponents();

      // inject
      router = TestBed.inject(Router);
      location = TestBed.inject(Location);
      sessionApiService = TestBed.inject(SessionApiService);
      sessionService = TestBed.inject(SessionService);
      matSnackBar = TestBed.inject(MatSnackBar);
      teacherService = TestBed.inject(TeacherService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    describe('Integration Test as ADMIN', () => {
      beforeEach(() => {
        // ARRANGE
        sessionService.sessionInformation =
          mockAdminSessionService.sessionInformation;

        fixture = TestBed.createComponent(DetailComponent);
        component = fixture.componentInstance;
      });

      it('should display delete button and hide participate menu buttons when Admin is logged', fakeAsync(() => {
        // ACT
        fixture.detectChanges();

        // ASSERT DETAIL HTTP REQUEST
        const reqDetail = httpMock.expectOne(`api/session/${sessionId}`);
        expect(reqDetail.request.method).toBe('GET');
        reqDetail.flush(mockSession);

        // WAIT FOR CHANGE IN THE DOM
        fixture.detectChanges();
        tick();

        // ASSERT TEACHERS HTTP REQUEST
        const reqTeacherDetail = httpMock.expectOne(
          `api/teacher/${mockTeacher.id}`
        );
        expect(reqTeacherDetail.request.method).toBe('GET');
        reqTeacherDetail.flush(mockTeacher);

        // GET HTML ELEMENTS
        const deleteBtnEl = getByDataTest(
          fixture,
          'delete-btn'
        ) as HTMLButtonElement;
        const participateMenuEl = getByDataTest(
          fixture,
          'participate-menu'
        ) as HTMLElement;

        // ASSERT
        expect(deleteBtnEl).not.toBeNull();
        expect(participateMenuEl).toBeNull();
      }));

      it('should delete a session and go to the sessions Page when delete button is clicked', fakeAsync(() => {
        // ARRANGE
        const spyNavigate = jest.spyOn(router, 'navigate');
        const spyMatSnackBar = jest.spyOn(matSnackBar, 'open');

        // ACT
        fixture.detectChanges();

        // ASSERT DETAIL HTTP REQUEST
        const reqDetail = httpMock.expectOne(`api/session/${sessionId}`);
        expect(reqDetail.request.method).toBe('GET');
        reqDetail.flush(mockSession);

        // WAIT FOR CHANGE IN THE DOM
        fixture.detectChanges();
        tick();

        // ASSERT TEACHERS HTTP REQUEST
        const reqTeacherDetail = httpMock.expectOne(
          `api/teacher/${mockTeacher.id}`
        );
        expect(reqTeacherDetail.request.method).toBe('GET');
        reqTeacherDetail.flush(mockTeacher);

        // GET HTML ELEMENTS
        const deleteBtnEl = getByDataTest(
          fixture,
          'delete-btn'
        ) as HTMLButtonElement;

        fixture.detectChanges();
        tick();

        deleteBtnEl.click();
        fixture.detectChanges();
        tick();

        // ASSERT DELETE HTTP REQUEST
        const reqDelete = httpMock.expectOne(`api/session/${mockSession.id}`);
        expect(reqDelete.request.method).toBe('DELETE');
        reqDelete.flush(true);

        fixture.detectChanges();
        tick(3000);

        // ASSERT
        expect(spyMatSnackBar).toHaveBeenCalledWith(
          'Session deleted !',
          'Close',
          { duration: 3000 }
        );
        expect(spyNavigate).toHaveBeenCalledWith(['sessions']);
        expect(location.path()).toBe('/sessions');
      }));
    });

    describe('Integration Test as USER', () => {
      beforeEach(() => {
        // ARRANGE
        sessionService.sessionInformation =
          mockUserSessionService.sessionInformation;

        fixture = TestBed.createComponent(DetailComponent);
        component = fixture.componentInstance;
      });

      it('should participate btn be enabled and unparticipate btn be null when the user is not register in a session', fakeAsync(() => {
        // ACT
        fixture.detectChanges();

        // ASSERT DETAIL HTTP REQUEST
        const reqDetail = httpMock.expectOne(`api/session/${sessionNoUsersId}`);
        expect(reqDetail.request.method).toBe('GET');
        reqDetail.flush(mockNoUsersSession); // return a class with no students

        // ASSERT TEACHERS HTTP REQUEST
        const reqTeacherDetail = httpMock.expectOne(
          `api/teacher/${mockTeacher.id}`
        );
        expect(reqTeacherDetail.request.method).toBe('GET');
        reqTeacherDetail.flush(mockTeacher); // return a teacher for the class

        // WAIT FOR CHANGE IN THE DOM
        fixture.detectChanges();
        tick();

        // GET HTML ELEMENTS
        const deleteBtnEl = getByDataTest(
          fixture,
          'delete-btn'
        ) as HTMLButtonElement;
        const participateBtnEl = getByDataTest(
          fixture,
          'participate-btn'
        ) as HTMLElement;
        const unParticipateBtnEl = getByDataTest(
          fixture,
          'unparticipate-btn'
        ) as HTMLElement;

        // ASSERT
        expect(deleteBtnEl).toBeNull(); // USER SO NO DELETE BTN
        expect(participateBtnEl).not.toBeNull();
        expect(unParticipateBtnEl).toBeNull();
      }));

      it('should unparticipate btn be enabled and participate btn be null when the user is registered in a session', fakeAsync(() => {
        // ACT
        fixture.detectChanges();

        // ASSERT DETAIL HTTP REQUEST
        const reqDetail = httpMock.expectOne(`api/session/${sessionNoUsersId}`);
        expect(reqDetail.request.method).toBe('GET');
        reqDetail.flush(mockSession); // return a class you participated in

        // ASSERT TEACHERS HTTP REQUEST
        const reqTeacherDetail = httpMock.expectOne(
          `api/teacher/${mockTeacher.id}`
        );
        expect(reqTeacherDetail.request.method).toBe('GET');
        reqTeacherDetail.flush(mockTeacher); // return a teacher for the class

        // WAIT FOR CHANGE IN THE DOM
        fixture.detectChanges();
        tick();

        // GET HTML ELEMENTS
        const deleteBtnEl = getByDataTest(
          fixture,
          'delete-btn'
        ) as HTMLButtonElement;
        const participateBtnEl = getByDataTest(
          fixture,
          'participate-btn'
        ) as HTMLElement;
        const unParticipateBtnEl = getByDataTest(
          fixture,
          'unparticipate-btn'
        ) as HTMLElement;

        // ASSERT
        expect(deleteBtnEl).toBeNull(); // USER SO NO DELETE BTN
        expect(participateBtnEl).toBeNull();
        expect(unParticipateBtnEl).not.toBeNull();
      }));
    });
  });
});
