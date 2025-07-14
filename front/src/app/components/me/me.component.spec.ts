import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SessionService } from '../../services/session.service';

import { MeComponent } from './me.component';
import { first, of } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;

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
    delete: jest.fn().mockReturnValue(of(true)),
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
  });
});
