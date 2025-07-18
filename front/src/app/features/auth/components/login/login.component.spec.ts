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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';

import { LoginComponent } from './login.component';
import { LoginRequest } from '../../interfaces/loginRequest.interface';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { getByDataTest } from 'src/test-utils/test-utils';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ListComponent } from 'src/app/features/sessions/components/list/list.component';
import { Location } from '@angular/common';

function getCommonImports(): any[] {
  return [
    RouterTestingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ];
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let location: Location;
  let authService: AuthService;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;

  const mockLoginRequest: LoginRequest = {
    email: 'test@test.com',
    password: 'test!1234',
  };

  const mockAuthService = {
    login: jest.fn(),
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
    logIn: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  const testRoutes = [{ path: 'sessions', component: ListComponent }];

  describe('Unit Test Suite', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [LoginComponent],
        providers: [
          {
            provide: SessionService,
            useValue: mockSessionService,
          },
          { provide: AuthService, useValue: mockAuthService },
          { provide: Router, useValue: mockRouter },
        ],
        imports: [...getCommonImports()],
      }).compileComponents();
      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('form should be invalid', () => {
      expect(component.form.valid).toBeFalsy();
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

    it('should mark email and password fields valid with valid format credentials', () => {
      // ARRANGE
      const email = component.form.controls['email'];
      const password = component.form.controls['password'];

      // ACT
      email.setValue('test@test.com');
      password.setValue('abcd1234');

      // ASSERT
      expect(email.valid).toBeTruthy();
      expect(password.valid).toBeTruthy();
      expect(component.form.valid).toBeTruthy();
    });

    it('should call authService, sessionService and router on Submit', () => {
      // ARRANGE
      mockAuthService.login.mockReturnValue(
        of(mockSessionService.sessionInformation)
      );

      // ACT
      component.form.setValue(mockLoginRequest);
      component.submit();

      // ASSERT
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginRequest);
      expect(mockSessionService.logIn).toHaveBeenCalledWith(
        mockSessionService.sessionInformation
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sessions']);
    });

    it('should set an Error when authService.login has an error', () => {
      // ARRANGE
      mockAuthService.login.mockReturnValue(
        throwError(() => new Error('Login failed'))
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
        declarations: [LoginComponent],
        providers: [SessionService, AuthService],
        imports: [
          ...getCommonImports(),
          HttpClientTestingModule,
          RouterTestingModule.withRoutes(testRoutes),
        ],
      }).compileComponents();

      // inject service
      authService = TestBed.inject(AuthService);
      sessionService = TestBed.inject(SessionService);
      router = TestBed.inject(Router);
      location = TestBed.inject(Location);
      httpMock = TestBed.inject(HttpTestingController);

      sessionService.sessionInformation = mockSessionService.sessionInformation;

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      httpMock.verify();
    });

    function getHtmlElements() {
      return {
        emailInputEl: getByDataTest(fixture, 'email') as HTMLInputElement,
        passwordInputEl: getByDataTest(fixture, 'password') as HTMLInputElement,
        submitBtnEl: getByDataTest(fixture, 'submit-btn') as HTMLButtonElement,
        errorEl: getByDataTest(fixture, 'error'),
      };
    }

    function fillingForm(email: string, password: string): void {
      const { emailInputEl, passwordInputEl } = getHtmlElements();
      emailInputEl.value = email;
      emailInputEl.dispatchEvent(new Event('input'));
      passwordInputEl.value = password;
      passwordInputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();
    }

    it('should login with valid login request', fakeAsync(() => {
      // ARRANGE
      const spySessionLogin = jest.spyOn(sessionService, 'logIn');

      // get HTML ELEM
      const { submitBtnEl } = getHtmlElements();
      expect(submitBtnEl.disabled).toBeTruthy();

      // ACT filling form
      fillingForm(mockLoginRequest.email, mockLoginRequest.password);

      // ASSERT SUBMIT
      expect(submitBtnEl.disabled).toBeFalsy(); // valid form so submit enabled

      // ACT submit form
      submitBtnEl.click();
      fixture.detectChanges();
      tick();

      // ASSERT HTTP REQUEST
      const reqAuth = httpMock.expectOne('api/auth/login');
      expect(reqAuth.request.method).toBe('POST');
      expect(reqAuth.request.body).toEqual(mockLoginRequest);

      // mock http response
      reqAuth.flush(mockSessionService.sessionInformation);
      fixture.detectChanges();
      tick();

      const { errorEl } = getHtmlElements();
      // ASSERT
      expect(spySessionLogin).toHaveBeenCalledWith(
        mockSessionService.sessionInformation
      );
      expect(location.path()).toBe('/sessions');
    }));

    it('should throw and display an errorin the DOM when login failed', fakeAsync(() => {
      // ARRANGE
      jest
        .spyOn(authService, 'login')
        .mockReturnValue(throwError(() => new Error('Login failed')));

      // get HTML ELEM
      const { submitBtnEl } = getHtmlElements();

      // ACT filling form
      fillingForm(mockLoginRequest.email, mockLoginRequest.password);

      // ASSERT THE BUTTON IS ENABLED
      expect(submitBtnEl.disabled).toBeFalsy();

      // ACT submit form
      submitBtnEl.click();
      fixture.detectChanges();
      tick();

      const { errorEl } = getHtmlElements();

      // ASSERT
      expect(errorEl).not.toBeNull();
      expect(errorEl.textContent).toBe('An error occurred');
    }));

    it('should disable submit button when form fields are invalid', fakeAsync(() => {
      // ARRANGE
      const { submitBtnEl } = getHtmlElements();

      // ACT
      fillingForm('', '');

      // ASSERT
      expect(submitBtnEl.disabled).toBeTruthy();
    }));
  });
});
