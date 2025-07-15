import { HttpClientModule } from '@angular/common/http';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LoginComponent } from '../login/login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';
import { getByDataTest } from 'src/test-utils/test-utils';

function getCommonImports(): any[] {
  return [
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ];
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;
  let location: Location;
  let httpMock: HttpTestingController;

  const mockAuthService = {
    register: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  const mockRegisterRequest = {
    email: 'test@test.com',
    firstName: 'test',
    lastName: 'test',
    password: 'test1234',
  };

  const testRoutes = [{ path: 'login', component: LoginComponent }];

  describe('Unit Test Suite', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [RegisterComponent],
        providers: [
          { provide: AuthService, useValue: mockAuthService },
          { provide: Router, useValue: mockRouter },
        ],
        imports: [...getCommonImports()],
      }).compileComponents();

      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('form should be invalid', () => {
      expect(component.form.valid).toBeFalsy();
    });

    it('should mark firstName field as invalid when firstName is empty', () => {
      // ARRANGE
      const firstName = component.form.controls['firstName'];

      // ACT
      firstName.setValue(''); // firstName empty

      // ASSERT
      expect(firstName.valid).toBeFalsy();
      expect(firstName.getError('required')).toBeTruthy();
    });

    it('should mark firstName field as invalid when firstName format is invalid', () => {
      // ARRANGE
      const firstName = component.form.controls['firstName'];

      // ACT
      firstName.setValue('ab'); // firstName length <3

      // ASSERT
      expect(firstName.valid).toBeFalsy();
      expect(firstName.getError('minlength')).toBeTruthy();
    });

    it('should mark lastName field as invalid when lastName is empty', () => {
      // ARRANGE
      const lastName = component.form.controls['lastName'];

      // ACT
      lastName.setValue(''); // firstName empty

      // ASSERT
      expect(lastName.valid).toBeFalsy();
      expect(lastName.getError('required')).toBeTruthy();
    });

    it('should mark lastName field as invalid when lastName format is invalid', () => {
      // ARRANGE
      const lastName = component.form.controls['lastName'];

      // ACT
      lastName.setValue('ab'); // firstName length <3

      // ASSERT
      expect(lastName.valid).toBeFalsy();
      expect(lastName.getError('minlength')).toBeTruthy();
    });

    it('should mark email field as invalid when email is empty', () => {
      // ARRANGE
      const email = component.form.controls['email'];

      // ACT
      email.setValue(''); // email empty

      // ASSERT
      expect(email.valid).toBeFalsy();
      expect(email.getError('required')).toBeTruthy();
    });

    it('should mark email field as invalid when email format is invalid', () => {
      // ARRANGE
      const email = component.form.controls['email'];

      // ACT
      email.setValue('test'); // set a wrong email without @

      // ASSERT
      expect(email.valid).toBeFalsy();
    });

    it('should mark password field as invalid when password is empty', () => {
      // ARRANGE
      const password = component.form.controls['password'];

      // ACT
      password.setValue(''); // empty password

      // ASSERT
      expect(password.valid).toBeFalsy();
      expect(password.getError('required')).toBeTruthy();
    });

    it('should mark password field as invalid when password format is incorrect', () => {
      // ARRANGE
      const password = component.form.controls['password'];

      // ACT
      password.setValue('ab'); // length < 3

      // ASSERT
      expect(password.valid).toBeFalsy();
      expect(password.getError('minlength')).toBeTruthy();
    });

    it('should mark the form as valid when all fields have valid input', () => {
      // ARRANGE
      const firstName = component.form.controls['firstName'];
      const lastName = component.form.controls['lastName'];
      const email = component.form.controls['email'];
      const password = component.form.controls['password'];

      // ACT
      firstName.setValue('vincent');
      lastName.setValue('Petit');
      email.setValue('test@test.com');
      password.setValue('test1234');

      // ASSERT
      expect(component.form.valid).toBeTruthy();
    });

    it('should call authService and router on submit()', () => {
      // ARRANGE
      mockAuthService.register.mockReturnValue(of(true));

      // ACT
      component.form.setValue(mockRegisterRequest);
      component.submit();

      // ASSERT
      expect(mockAuthService.register).toHaveBeenCalledWith(
        mockRegisterRequest
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should return an error when authService.register has an error', () => {
      // ARRANGE
      mockAuthService.register.mockReturnValue(
        throwError(() => new Error('Register failed'))
      );

      // ACT
      component.submit();

      // ASSERT
      expect(component.onError).toBe(true);
    });
  });

  describe('Integration Test Suite', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [RegisterComponent],
        providers: [AuthService],
        imports: [
          ...getCommonImports(),
          HttpClientTestingModule,
          RouterTestingModule.withRoutes(testRoutes),
        ],
      }).compileComponents();

      // inject
      authService = TestBed.inject(AuthService);
      router = TestBed.inject(Router);
      location = TestBed.inject(Location);
      httpMock = TestBed.inject(HttpTestingController);

      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      httpMock.verify();
    });

    function getHtmlElements() {
      return {
        firstNameInputEl: getByDataTest(
          fixture,
          'firstName'
        ) as HTMLInputElement,
        lastNameInputEl: getByDataTest(fixture, 'lastName') as HTMLInputElement,
        emailInputEl: getByDataTest(fixture, 'email') as HTMLInputElement,
        passwordInputEl: getByDataTest(fixture, 'password') as HTMLInputElement,
        submitBtnEl: getByDataTest(fixture, 'submit-btn') as HTMLButtonElement,
        errorEl: getByDataTest(fixture, 'error'),
      };
    }

    function fillingForm(
      firstName: string,
      lastName: string,
      email: string,
      password: string
    ) {
      const {
        firstNameInputEl,
        lastNameInputEl,
        emailInputEl,
        passwordInputEl,
      } = getHtmlElements();
      firstNameInputEl.value = firstName;
      firstNameInputEl.dispatchEvent(new Event('input'));
      lastNameInputEl.value = lastName;
      lastNameInputEl.dispatchEvent(new Event('input'));
      emailInputEl.value = email;
      emailInputEl.dispatchEvent(new Event('input'));
      passwordInputEl.value = password;
      passwordInputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();
    }

    it('should register with valid form request', fakeAsync(() => {
      // ARRANGE
      const { submitBtnEl } = getHtmlElements();
      expect(submitBtnEl.disabled).toBeTruthy();

      // ACT filling register form
      fillingForm(
        mockRegisterRequest.firstName,
        mockRegisterRequest.lastName,
        mockRegisterRequest.email,
        mockRegisterRequest.password
      );

      // ASSERT
      expect(submitBtnEl.disabled).toBeFalsy();

      // ACT submit
      submitBtnEl.click();
      fixture.detectChanges();
      tick();

      // ASSERT HTTP REQUEST
      const reqAuth = httpMock.expectOne('api/auth/register');
      expect(reqAuth.request.method).toBe('POST');
      expect(reqAuth.request.body).toEqual(mockRegisterRequest);

      // mock http response
      reqAuth.flush(of(null));
      fixture.detectChanges();
      tick();

      // ASSERT LOCATION
      expect(location.path()).toBe('/login');
    }));

    it('shoudl throw and display an error when register failed', fakeAsync(() => {
      // ARRANGE
      jest
        .spyOn(authService, 'register')
        .mockReturnValue(throwError(() => new Error('Register failed')));

      // get submit btn
      const { submitBtnEl } = getHtmlElements();

      // ACT filling form
      fillingForm(
        mockRegisterRequest.firstName,
        mockRegisterRequest.lastName,
        mockRegisterRequest.email,
        mockRegisterRequest.password
      );

      // ACT submit form
      submitBtnEl.click();
      fixture.detectChanges();
      tick();

      // ASSERT
      const { errorEl } = getHtmlElements();
      expect(errorEl).not.toBeNull();
      expect(errorEl.textContent).toBe('An error occurred');
    }));

    it('should disable submit button when form fields are empty or invalid', fakeAsync(() => {
      // ARRANGE
      const { submitBtnEl } = getHtmlElements();

      // ACT - password length empty or lower than 3
      fillingForm(
        mockRegisterRequest.firstName,
        mockRegisterRequest.lastName,
        mockRegisterRequest.email,
        ''
      );

      // ASSERT
      expect(submitBtnEl.disabled).toBeTruthy();
    }));
  });
});
