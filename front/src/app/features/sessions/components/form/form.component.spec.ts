import { HttpClientModule } from '@angular/common/http';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
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
import { Location } from '@angular/common';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { getByDataTest } from 'src/test-utils/test-utils';
import { ListComponent } from '../list/list.component';

function getCommonImports() {
  return [
    RouterTestingModule.withRoutes([
      { path: 'sessions', component: ListComponent },
    ]),
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
  let location: Location;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let tearcherService: TeacherService;
  let sessionApiService: SessionApiService;
  let matSnackBar: MatSnackBar;

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

  const sessionId: string =
    mockAdminSessionService.sessionInformation.id.toString();

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue(sessionId),
      },
    },
  };

  describe('Unit Test Suite', () => {
    const mockSessionApiService = {
      detail: jest.fn().mockReturnValue(of(mockSession)),
      create: jest.fn(),
      update: jest.fn(),
    };

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

      it('should mark name field as invalid when name is empty', () => {
        // Init
        fixture.detectChanges();

        // ARRANGE
        const nameEl = component.sessionForm!.controls['name'];

        // ACT
        nameEl.setValue(''); // name empty

        // ASSERT
        expect(nameEl.valid).toBeFalsy();
        expect(nameEl.getError('required')).toBeTruthy();
      });

      it('should mark date field as invalid when date is empty', () => {
        // Init
        fixture.detectChanges();

        // ARRANGE
        const dateEl = component.sessionForm!.controls['date'];

        // ACT
        dateEl.setValue(''); // date empty

        // ASSERT
        expect(dateEl.valid).toBeFalsy();
        expect(dateEl.getError('required')).toBeTruthy();
      });

      it('should mark teachers field as invalid when teachers is empty', () => {
        // Init
        fixture.detectChanges();

        // ARRANGE
        const tearcherSelect = component.sessionForm!.controls['teacher_id'];

        // ACT
        tearcherSelect.setValue(null); // select empty

        // ASSERT
        expect(tearcherSelect.valid).toBeFalsy();
        expect(tearcherSelect.getError('required')).toBeTruthy();
      });

      it('should mark description field as invalid when description is empty', () => {
        // Init
        fixture.detectChanges();

        // ARRANGE
        const descriptionEl = component.sessionForm!.controls['description'];

        // ACT
        descriptionEl.setValue(''); // description empty

        // ASSERT
        expect(descriptionEl.valid).toBeFalsy();
        expect(descriptionEl.getError('required')).toBeTruthy();
      });

      it('should mark the form as valid when all fields have valid input', () => {
        // Init
        fixture.detectChanges();

        // ARRANGE
        const nameEl = component.sessionForm!.controls['name'];
        const dateEl = component.sessionForm!.controls['date'];
        const tearcherSelect = component.sessionForm!.controls['teacher_id'];
        const descriptionEl = component.sessionForm!.controls['description'];

        // ACT
        nameEl.setValue(mockSession.name);
        dateEl.setValue(mockSession.date);
        tearcherSelect.setValue(mockSession.teacher_id);
        descriptionEl.setValue(mockSession.description);

        // ASSERT
        expect(component.sessionForm!.valid).toBeTruthy();
      });
    });
  });

  describe('Integration Test Suite', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [...getCommonImports(), HttpClientTestingModule],
        providers: [
          SessionService,
          SessionApiService,
          TeacherService,
          MatSnackBar,
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
        ],
        declarations: [FormComponent],
      }).compileComponents();

      // inject
      router = TestBed.inject(Router);
      sessionService = TestBed.inject(SessionService);
      sessionApiService = TestBed.inject(SessionApiService);
      tearcherService = TestBed.inject(TeacherService);
      location = TestBed.inject(Location);
      httpMock = TestBed.inject(HttpTestingController);
      matSnackBar = TestBed.inject(MatSnackBar);

      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should update a session and then exit the page when save button is clicked', fakeAsync(() => {
      // ARRANGE
      sessionService.sessionInformation =
        mockAdminSessionService.sessionInformation;
      jest.spyOn(router, 'url', 'get').mockReturnValue('sessions/update');
      const spySnackBarOpen = jest.spyOn(matSnackBar, 'open');

      // INIT
      fixture.detectChanges();
      tick();

      // ASSERT DETAIL HTTP REQUEST
      const reqDetail = httpMock.expectOne(`api/session/${sessionId}`);
      expect(reqDetail.request.method).toBe('GET');
      reqDetail.flush(mockSession);

      // WAIT FOR CHANGE IN THE DOM
      fixture.detectChanges();
      tick();

      // ASSERT TEACHERS HTTP REQUEST
      const reqTeacherAll = httpMock.expectOne(`api/teacher`);
      expect(reqTeacherAll.request.method).toBe('GET');
      reqTeacherAll.flush(mockTeachers);

      fixture.detectChanges();
      tick();

      // ASSERT Form value
      expect(component.sessionForm?.value).not.toBeNull();

      // Modify the name value in the form
      const nameInputEl = getByDataTest(fixture, 'name') as HTMLInputElement;
      nameInputEl.value = 'New Name';
      nameInputEl.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      tick();

      // ASSERT THE NAME INPUT AS CHANGED
      expect(nameInputEl.value).toBe('New Name');

      // GET SUBMIT BTN
      const saveBtnEl = getByDataTest(fixture, 'save-btn') as HTMLButtonElement;
      expect(saveBtnEl.disabled).toBeFalsy();
      saveBtnEl.click();

      fixture.detectChanges();
      tick();

      // ASSERT DETAIL HTTP REQUEST
      const reqUpdate = httpMock.expectOne(`api/session/${sessionId}`);
      expect(reqUpdate.request.method).toBe('PUT');
      expect(reqUpdate.request.body).toEqual({
        name: 'New Name',
        date: mockSession.date.toISOString().split('T')[0],
        description: mockSession.description,
        teacher_id: mockSession.id,
      });
      reqUpdate.flush(mockSession);

      // ASSERT EXIT PAGE
      expect(spySnackBarOpen).toHaveBeenCalledWith(
        'Session updated !',
        'Close',
        { duration: 3000 }
      );
      fixture.detectChanges();
      tick(3000);

      expect(location.path()).toBe('/sessions');
    }));

    it('should create a new session and then exit the page when save button is clicked', fakeAsync(() => {
      // ARRANGE
      sessionService.sessionInformation =
        mockAdminSessionService.sessionInformation;
      jest.spyOn(router, 'url', 'get').mockReturnValue('sessions/create');
      const spySnackBarOpen = jest.spyOn(matSnackBar, 'open');

      // INIT
      fixture.detectChanges();
      tick();

      // ASSERT TEACHERS HTTP REQUEST
      const reqTeacherAll = httpMock.expectOne(`api/teacher`);
      expect(reqTeacherAll.request.method).toBe('GET');
      reqTeacherAll.flush(mockTeachers);

      fixture.detectChanges();
      tick();

      // ASSERT Form value
      expect(component.sessionForm?.value).toEqual({
        date: '',
        description: '',
        name: '',
        teacher_id: '',
      });

      // ASSERT BUTTON SAVE disable
      const saveBtnEl = getByDataTest(fixture, 'save-btn') as HTMLButtonElement;
      expect(saveBtnEl.disabled).toBeTruthy();

      // FILLING THE FORM
      const nameInputEl = getByDataTest(fixture, 'name') as HTMLInputElement;
      const dateInputEl = getByDataTest(fixture, 'date') as HTMLInputElement;
      const descTextEl = getByDataTest(
        fixture,
        'description'
      ) as HTMLTextAreaElement;

      nameInputEl.value = mockSession.name;
      nameInputEl.dispatchEvent(new Event('input'));
      dateInputEl.value = mockSession.date.toISOString().split('T')[0];
      dateInputEl.dispatchEvent(new Event('input'));
      descTextEl.value = mockSession.description;
      descTextEl.dispatchEvent(new Event('input'));
      component.sessionForm!.controls['teacher_id'].setValue(0);

      fixture.detectChanges();
      tick();

      expect(component.sessionForm?.value).toEqual({
        date: mockSession.date.toISOString().split('T')[0],
        description: mockSession.description,
        name: mockSession.name,
        teacher_id: 0,
      });

      // ASSERT the button save is enabled
      expect(saveBtnEl.disabled).toBeFalsy();

      // ACT
      saveBtnEl.click();

      fixture.detectChanges();
      tick();

      // ASSERT DETAIL HTTP REQUEST
      const reqCreate = httpMock.expectOne(`api/session`);
      expect(reqCreate.request.method).toBe('POST');
      reqCreate.flush(mockSession);

      // WAIT FOR CHANGE IN THE DOM
      fixture.detectChanges();
      tick();

      // ASSERT SNACKBAR + REDIRECTION
      expect(spySnackBarOpen).toHaveBeenCalledWith(
        'Session created !',
        'Close',
        { duration: 3000 }
      );

      tick(3000);
      expect(location.path()).toBe('/sessions');
    }));
  });
});
