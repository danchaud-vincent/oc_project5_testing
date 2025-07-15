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
  let authService: AuthService;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;

  const mockLoginRequest = {
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

    it('should mark email field as invalid when email format is incorrect', () => {
      // ARRANGE
      const email = component.form.controls['email'];

      // ACT
      email.setValue(''); // email empty

      // ASSERT
      expect(email.valid).toBeFalsy();
      expect(email.getError('required')).toBeTruthy();

      // ACT
      email.setValue('test'); // set a wrong email without @

      // ASSERT
      expect(email.valid).toBeFalsy();
    });

    it('should mark password field as invalid when password format is incorrect', () => {
      // ARRANGE
      const password = component.form.controls['password'];

      // ACT
      password.setValue(''); // empty password

      // ASSERT
      expect(password.valid).toBeFalsy();
      expect(password.getError('required')).toBeTruthy();

      // ACT
      password.setValue('ab'); // length < 3

      // ASSERT
      expect(password.valid).toBeFalsy();
      expect(password.getError('minlength')).toBeTruthy();
    });

    it('should mark email and password fiels valid with valid format credentials', () => {
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
      component.submit();

      // ASSERT
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
        imports: [...getCommonImports(), HttpClientTestingModule],
      }).compileComponents();

      // inject service
      authService = TestBed.inject(AuthService);
      sessionService = TestBed.inject(SessionService);
      router = TestBed.inject(Router);
      httpMock = TestBed.inject(HttpTestingController);

      sessionService.sessionInformation = mockSessionService.sessionInformation;

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should login with valid login request', fakeAsync(() => {
      // ARRANGE
      const spySessionLogin = jest.spyOn(sessionService, 'logIn');
      const spyNavigate = jest
        .spyOn(router, 'navigate')
        .mockReturnValue(Promise.resolve(true));

      const emailInputEl = getByDataTest(fixture, 'email') as HTMLInputElement;
      const passwordInputEl = getByDataTest(
        fixture,
        'password'
      ) as HTMLInputElement;
      const submitBtnEl = getByDataTest(
        fixture,
        'submit-btn'
      ) as HTMLButtonElement;
      const errorEl = getByDataTest(fixture, 'error');

      // ACT filling form
      emailInputEl.value = mockLoginRequest.email;
      emailInputEl.dispatchEvent(new Event('input'));
      passwordInputEl.value = mockLoginRequest.password;
      passwordInputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

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

      // ASSERT
      expect(spySessionLogin).toHaveBeenCalledWith(
        mockSessionService.sessionInformation
      );
      expect(spyNavigate).toHaveBeenCalledWith(['/sessions']);
      expect(component.onError).toBeFalsy();
      expect(errorEl).toBeNull();
    }));
  });
});
