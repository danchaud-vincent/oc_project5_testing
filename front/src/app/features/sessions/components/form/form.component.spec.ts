import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { SessionApiService } from '../../services/session-api.service';

import { FormComponent } from './form.component';
import { Teacher } from 'src/app/interfaces/teacher.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherService } from 'src/app/services/teacher.service';
import { of } from 'rxjs';

function getCommonImports() {
  return [
    RouterTestingModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatSelectModule,
    BrowserAnimationsModule,
  ];
}

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let router: Router;

  const mockSessionService = {
    sessionInformation: {
      admin: true,
    },
  };

  describe('Unit Test Suite', () => {
    const mockSession = {
      id: 1,
      name: 'session1',
      description: 'a session',
      date: new Date('2025-12-01'),
      teacher_id: 1,
      users: [],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    const mockSessionApiService = {
      detail: jest.fn().mockReturnValue(of(mockSession)),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockTeachers: Teacher[] = [
      {
        id: 1,
        lastName: 'teacher1',
        firstName: 'teacher1',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 2,
        lastName: 'teacher2',
        firstName: 'teacher2',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
      },
    ];

    const mockTeacherService = {
      all: jest.fn(),
    };

    const mockMatSnackBar = {
      open: jest.fn(),
    };

    describe('Unit Test as USER', () => {
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
          imports: [...getCommonImports()],
          providers: [
            { provide: SessionService, useValue: mockUserSessionService },
            { provide: SessionApiService, useValue: mockSessionApiService },
            { provide: TeacherService, useValue: mockTeacherService },
            { provide: MatSnackBar, useValue: mockMatSnackBar },
          ],
          declarations: [FormComponent],
        }).compileComponents();

        // inject
        router = TestBed.inject(Router);

        fixture = TestBed.createComponent(FormComponent);
        component = fixture.componentInstance;
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should navigate to /session if not an ADMIN', () => {
        // ARRANGE
        const spyRoute = jest.spyOn(router, 'navigate');

        // ACT ngOnInit()
        fixture.detectChanges();

        // ASSERT
        expect(spyRoute).toHaveBeenCalledWith(['/sessions']);
      });
    });

    describe('Unit Test as ADMIN', () => {
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

      const sessionId: string =
        mockAdminSessionService.sessionInformation.id.toString();

      const mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jest.fn().mockReturnValue(sessionId),
          },
        },
      };

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [...getCommonImports()],
          providers: [
            { provide: SessionService, useValue: mockAdminSessionService },
            { provide: SessionApiService, useValue: mockSessionApiService },
            { provide: TeacherService, useValue: mockTeacherService },
            { provide: MatSnackBar, useValue: mockMatSnackBar },
            { provide: ActivatedRoute, useValue: mockActivatedRoute },
          ],
          declarations: [FormComponent],
        }).compileComponents();

        // inject
        router = TestBed.inject(Router);

        fixture = TestBed.createComponent(FormComponent);
        component = fixture.componentInstance;
      });

      it('should call detail with the route param ID and fill the form when updating a session', () => {
        // ARRANGE
        jest.spyOn(router, 'url', 'get').mockReturnValue('sessions/update');

        // ACT : onInit()
        fixture.detectChanges();

        // ASSERT
        expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith(
          'id'
        );
        expect(mockSessionApiService.detail).toHaveBeenCalledWith(
          `${sessionId}`
        );

        expect(component.sessionForm!.value).toEqual({
          name: mockSession.name,
          date: new Date(mockSession.date).toISOString().split('T')[0],
          teacher_id: mockSession.teacher_id,
          description: mockSession.description,
        });
      });

      it('should fill the form with empty values when creating a new session', () => {
        // ARRANGE
        jest.spyOn(router, 'url', 'get').mockReturnValue('sessions/create');

        // ACT : onInit
        fixture.detectChanges();

        // ASSERT
        expect(component.sessionForm?.value).toEqual({
          date: '',
          description: '',
          name: '',
          teacher_id: '',
        });
      });
    });
  });
});
