import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Unit Test Suite', () => {
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
  });
});
