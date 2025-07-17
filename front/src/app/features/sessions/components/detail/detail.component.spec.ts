import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let sessionService: SessionService;
  let sessionApiService: SessionApiService;
  let teacherService: TeacherService;
  let router: Router;
  let location: Location;
  let matSnackBar: MatSnackBar;

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

  const mockteacher = {
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

  describe('Unit Test Suite', () => {
    const mockSessionApiService = {
      delete: jest.fn(),
      detail: jest.fn().mockReturnValue(of(mockSession)),
      participate: jest.fn(),
      unParticipate: jest.fn(),
    };
    const mockTeacherService = {
      detail: jest.fn().mockReturnValue(of(mockteacher)),
    };

    const mockMatSnackBar = {
      open: jest.fn(),
    };

    describe('Unit test as USER', () => {
      const mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jest.fn().mockReturnValue(sessionId),
          },
        },
      };

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

      it('should create', () => {
        // ACT
        fixture.detectChanges();
        // ASSERT
        expect(component).toBeTruthy();
      });

      it('should fetch the session on Init by calling sessionApiService and teacherService', () => {
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

      it('should display the snackBar and navigate to /sessions on delete', () => {});
    });
  });
});
