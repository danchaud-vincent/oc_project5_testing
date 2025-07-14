import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let userService: UserService;
  let sessionService: SessionService;
  let router: Router;
  let matSnackBar: MatSnackBar;

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

  const mockSessionService = {
    sessionInformation: {
      token: 'Bearer',
      type: 'token',
      id: 1,
      username: 'james_t',
      firstName: 'james',
      lastName: 'test',
      admin: true,
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
        imports: [
          MatSnackBarModule,
          HttpClientModule,
          MatCardModule,
          MatFormFieldModule,
          MatIconModule,
          MatInputModule,
        ],
        providers: [
          { provide: UserService, useValue: mockUserService },
          { provide: SessionService, useValue: mockSessionService },
          { provide: Router, useValue: mockRouter },
          { provide: MatSnackBar, useValue: mockMatSnackBar },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(MeComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      // ARRANGE
      mockUserService.getById.mockReturnValue(of(mockAdmin));

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
        mockSessionService.sessionInformation.id.toString();
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
      expect(mockSessionService.logOut).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Integration Test Suite', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [MeComponent],
        imports: [
          MatSnackBarModule,
          HttpClientModule,
          MatCardModule,
          MatFormFieldModule,
          MatIconModule,
          MatInputModule,
          RouterTestingModule,
        ],
        providers: [UserService, SessionService, MatSnackBar],
      }).compileComponents();

      // inject
      userService = TestBed.inject(UserService);
      sessionService = TestBed.inject(SessionService);
      router = TestBed.inject(Router);
      matSnackBar = TestBed.inject(MatSnackBar);

      sessionService.sessionInformation = mockSessionService.sessionInformation;

      fixture = TestBed.createComponent(MeComponent);
      component = fixture.componentInstance;
    });

    it('should fetch user data and display admin specific data in the DOM on init', () => {
      // ARRANGE
      const spyGetById = jest
        .spyOn(userService, 'getById')
        .mockReturnValue(of(mockAdmin));
      const sessionId: string =
        mockSessionService.sessionInformation.id.toString();
      const pipe = new DatePipe('en-US');
      const createdAt = pipe.transform(mockAdmin.createdAt, 'longDate');
      const updatedAt = pipe.transform(mockAdmin.updatedAt, 'longDate');

      // ACT
      fixture.detectChanges();

      const nameEl: HTMLElement = getByDataTest(fixture, 'name');
      const emailEl: HTMLElement = getByDataTest(fixture, 'email');
      const adminEl: HTMLElement = getByDataTest(fixture, 'admin');
      const createDateEl: HTMLElement = getByDataTest(fixture, 'createdDate');
      const updateDateEl: HTMLElement = getByDataTest(fixture, 'updatedDate');
      const deleteBtnEl: HTMLElement = getByDataTest(fixture, 'delete-btn');

      // ASSERT
      expect(spyGetById).toHaveBeenCalledWith(sessionId);
      expect(nameEl.textContent).toBe(
        `Name: ${mockAdmin.firstName} ${mockAdmin.lastName.toUpperCase()}`
      );
      expect(emailEl.textContent).toBe(`Email: ${mockAdmin.email}`);
      expect(adminEl.textContent).not.toBeNull();
      expect(deleteBtnEl).toBeNull();
      expect(createDateEl.textContent).toBe(`Create at:  ${createdAt}`);
      expect(updateDateEl.textContent).toBe(`Last update:  ${updatedAt}`);
    });

    it('should call window.history.back when the arrow button is clicked()', () => {
      // ARRANGE
      const spyWindowBack = jest.spyOn(window.history, 'back');

      // ACT
      const btnBack: HTMLButtonElement = fixture.nativeElement.querySelector(
        '[data-test="back-btn"]'
      );
      btnBack.click();

      // ASSERT
      expect(spyWindowBack).toHaveBeenCalled();
    });
  });
});
