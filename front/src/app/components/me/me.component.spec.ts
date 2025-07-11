import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SessionService } from 'src/app/services/session.service';
import { expect, it } from '@jest/globals';
import { MeComponent } from './me.component';
import { By } from '@angular/platform-browser';
import { User } from 'src/app/interfaces/user.interface';
import { fn } from 'cypress/types/jquery';
import { UserService } from 'src/app/services/user.service';
import { of } from 'rxjs';

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;

  const mockUser: User = {
    id: 1,
    email: 'test@test.com',
    lastName: 'testLast',
    firstName: 'testFirst',
    admin: true,
    password: 'test',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
  };

  const mockUserService = {
    getById: jest.fn().mockReturnValue(of(mockUser)),
    delete: jest.fn().mockReturnValue(of(`api/user/${mockUser.id}`)),
  };

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1,
    },
    logOut: jest.fn(),
  };

  const mockMatSnackBar = {
    open: jest.fn(),
  };

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
        { provide: SessionService, useValue: mockSessionService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatSnackBar, useValue: mockMatSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Unit Test Suite', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load user information on ngOnInit', () => {
      // ASSERT
      expect(mockUserService.getById).toHaveBeenCalledWith(
        mockSessionService.sessionInformation.id.toString()
      );

      expect(component.user).toEqual(mockUser);
    });

    it('should call window.history.back when back() is called', () => {
      // ARRANGE
      const spy = jest.spyOn(window.history, 'back');

      // ACT
      component.back();

      // ASSERT
      expect(spy).toHaveBeenCalled();
    });

    it('should delete a user on delete()', () => {
      // ACT
      component.delete();
      fixture.detectChanges();

      // ASSERT
      expect(mockUserService.delete).toHaveBeenCalledWith(
        mockSessionService.sessionInformation.id.toString()
      );
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Your account has been deleted !',
        'Close',
        { duration: 3000 }
      );
      expect(mockSessionService.logOut).toHaveBeenCalled();
    });
  });
});
