import { HttpClientModule } from '@angular/common/http';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SessionService } from '../../services/session.service';

import { MeComponent } from './me.component';
import { of } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { getByDataTest } from 'src/test-utils/test-utils';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

function getCommonImports() {
  return [
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NoopAnimationsModule,
  ];
}

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let userService: UserService;
  let sessionService: SessionService;
  let router: Router;
  let matSnackBar: MatSnackBar;
  let httpMock: HttpTestingController;

  const mockAdmin = {
    id: 1,
    email: 'admin@email.com',
    lastName: 'test',
    firstName: 'admin',
    admin: true,
    password: 'admin',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockUser = {
    id: 2,
    email: 'user@email.com',
    lastName: 'test',
    firstName: 'user',
    admin: false,
    password: 'user',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockSessionServiceAdmin = {
    sessionInformation: {
      token: 'Bearer',
      type: 'token',
      id: 1,
      username: 'admin',
      firstName: 'admin',
      lastName: 'test',
      admin: true,
    },
    logOut: jest.fn(),
  };

  const mockSessionServiceUser = {
    sessionInformation: {
      token: 'Bearer',
      type: 'token',
      id: 2,
      username: 'user',
      firstName: 'user',
      lastName: 'test',
      admin: false,
    },
    logOut: jest.fn(),
  };

  const mockUserService = {
    getById: jest.fn(),
    delete: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  const mockMatSnackBar = {
    open: jest.fn(),
  };

  describe('Unit Test Suite', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [MeComponent],
        imports: [HttpClientModule, ...getCommonImports()],
        providers: [
          { provide: UserService, useValue: mockUserService },
          { provide: SessionService, useValue: mockSessionServiceUser },
          { provide: Router, useValue: mockRouter },
          { provide: MatSnackBar, useValue: mockMatSnackBar },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(MeComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      // ARRANGE
      mockUserService.getById.mockReturnValue(of(mockUser));

      // ACT
      fixture.detectChanges();

      // ASSERT
      expect(component).toBeTruthy();
    });

    it('should call userService.getById and set user data on ngOnInit', () => {
      // ARRANGE
      mockUserService.getById.mockReturnValue(of(mockUser));

      // ACT
      fixture.detectChanges();

      // ASSERT
      expect(component.user).toEqual(mockUser);
    });

    it('should navigate back in history when back() is called', () => {
      // ARRANGE
      const spyWindowBack = jest.spyOn(window.history, 'back');

      // ACT
      component.back();

      // ASSERT
      expect(spyWindowBack).toHaveBeenCalled();
    });

    it('should delete the current user and perform logout + navigation', () => {
      // ARRANGE
      const userId: string =
        mockSessionServiceUser.sessionInformation.id.toString();
      mockUserService.delete.mockReturnValue(of(true));

      // ACT
      component.delete();

      // ASSERT
      expect(mockUserService.delete).toHaveBeenCalledWith(userId);
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Your account has been deleted !',
        'Close',
        { duration: 3000 }
      );
      expect(mockSessionServiceUser.logOut).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Integration Test Suite', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [MeComponent],
        imports: [
          ...getCommonImports(),
          HttpClientModule,
          RouterTestingModule,
          HttpClientTestingModule,
        ],
        providers: [UserService, SessionService, MatSnackBar],
      }).compileComponents();

      // inject
      userService = TestBed.inject(UserService);
      sessionService = TestBed.inject(SessionService);
      router = TestBed.inject(Router);
      matSnackBar = TestBed.inject(MatSnackBar);
      httpMock = TestBed.inject(HttpTestingController);

      fixture = TestBed.createComponent(MeComponent);
      component = fixture.componentInstance;
    });

    it('should fetch ADMIN data and display ADMIN specific data in the DOM on init', () => {
      // ARRANGE
      sessionService.sessionInformation =
        mockSessionServiceAdmin.sessionInformation;

      const spyGetById = jest
        .spyOn(userService, 'getById')
        .mockReturnValue(of(mockAdmin));
      const sessionId: string =
        mockSessionServiceAdmin.sessionInformation.id.toString();
      const pipe = new DatePipe('en-US');
      const createdAt = pipe.transform(mockAdmin.createdAt, 'longDate');
      const updatedAt = pipe.transform(mockAdmin.updatedAt, 'longDate');

      // ACT
      fixture.detectChanges();

      // ASSERT
      expect(spyGetById).toHaveBeenCalledWith(sessionId);
      expect(getByDataTest(fixture, 'name').textContent).toBe(
        `Name: ${mockAdmin.firstName} ${mockAdmin.lastName.toUpperCase()}`
      );
      expect(getByDataTest(fixture, 'email').textContent).toContain(
        `${mockAdmin.email}`
      );
      expect(getByDataTest(fixture, 'admin').textContent).toContain('admin');
      expect(getByDataTest(fixture, 'delete-btn')).toBeNull();
      expect(getByDataTest(fixture, 'createdDate').textContent).toContain(
        `${createdAt}`
      );
      expect(getByDataTest(fixture, 'updatedDate').textContent).toContain(
        `${updatedAt}`
      );
    });

    it('should call window.history.back when the arrow button is clicked()', () => {
      // ARRANGE
      sessionService.sessionInformation =
        mockSessionServiceAdmin.sessionInformation;
      const spyWindowBack = jest.spyOn(window.history, 'back');

      // ACT
      fixture.detectChanges();
      const btnBack = getByDataTest(fixture, 'back-btn') as HTMLButtonElement;
      btnBack.click();

      // ASSERT
      expect(spyWindowBack).toHaveBeenCalled();
    });

    it('should delete by available when we are a USER and perform a logout and navigation on delete', fakeAsync(() => {
      // ARRANGE
      const spyOpen = jest.spyOn(matSnackBar, 'open');
      const spyLogOut = jest.spyOn(sessionService, 'logOut');
      const spyNavigate = jest.spyOn(router, 'navigate');
      sessionService.sessionInformation =
        mockSessionServiceUser.sessionInformation;

      // ngOnInit
      fixture.detectChanges();

      // ASSERT HTTP REQUEST
      const reqGetByIt = httpMock.expectOne(
        `api/user/${mockSessionServiceUser.sessionInformation.id}`
      );
      expect(reqGetByIt.request.method).toBe('GET');
      reqGetByIt.flush(mockUser); // return a mockUser

      expect(component.user).toEqual(mockUser);

      fixture.detectChanges();

      // get delete button
      const btnDeleteEl = getByDataTest(
        fixture,
        'delete-btn'
      ) as HTMLButtonElement;

      // Delete
      expect(btnDeleteEl).not.toBeNull(); // component should show the delete btn for a user
      btnDeleteEl.click();

      // ASSERT HTTP REQUEST
      const reqDelete = httpMock.expectOne(
        `api/user/${mockSessionServiceUser.sessionInformation.id}`
      );
      expect(reqDelete.request.method).toBe('DELETE');
      reqDelete.flush(null);

      tick(3000); // wait snackBar

      // ASSERT
      expect(spyOpen).toHaveBeenCalledWith(
        'Your account has been deleted !',
        'Close',
        { duration: 3000 }
      );
      expect(spyLogOut).toHaveBeenCalled();
      expect(spyNavigate).toHaveBeenCalledWith(['/']);

      httpMock.verify();
    }));
  });
});
