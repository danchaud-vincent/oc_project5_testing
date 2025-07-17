import { HttpClientModule } from '@angular/common/http';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';

import { AppComponent } from './app.component';
import { of } from 'rxjs';
import { SessionService } from './services/session.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { getByDataTest } from 'src/test-utils/test-utils';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let router: Router;
  let location: Location;
  let sessionService: SessionService;

  const testRoutes = [{ path: '', component: AppComponent }];

  const mockSessionInformation = {
    token: 'Bearer',
    type: 'token',
    id: 1,
    username: 'admin',
    firstName: 'admin',
    lastName: 'test',
    admin: true,
  };

  describe('Unit Test suite', () => {
    const mockSessionService = {
      logOut: jest.fn(),
      $isLogged: jest.fn().mockReturnValue(of(true)),
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [RouterTestingModule, HttpClientModule, MatToolbarModule],
        providers: [{ provide: SessionService, useValue: mockSessionService }],
        declarations: [AppComponent],
      }).compileComponents();

      // INJECT
      router = TestBed.inject(Router);

      fixture = TestBed.createComponent(AppComponent);
      app = fixture.componentInstance;
    });

    it('should create the app', () => {
      expect(app).toBeTruthy();
    });

    it('should session Service been called when isLogged called', () => {
      // ACT
      app.$isLogged();

      // ASSERT
      expect(mockSessionService.$isLogged).toHaveBeenCalled();
    });

    it('should call sessionService.logOut and navigate to Home page', () => {
      // ARRANGE
      const spyNavigate = jest.spyOn(router, 'navigate');

      // ACT
      app.logout();

      // ASSERT
      expect(mockSessionService.logOut).toHaveBeenCalled();
      expect(spyNavigate).toHaveBeenCalledWith(['']);
    });
  });

  describe('Integration Test Suite', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes(testRoutes),
          HttpClientModule,
          MatToolbarModule,
        ],
        providers: [SessionService],
        declarations: [AppComponent],
      }).compileComponents();

      // INJECT
      router = TestBed.inject(Router);
      location = TestBed.inject(Location);
      sessionService = TestBed.inject(SessionService);

      fixture = TestBed.createComponent(AppComponent);
      app = fixture.componentInstance;
    });

    it('should display logOut button if logged, and not display register menu', () => {
      // ARRANGE
      jest.spyOn(sessionService, '$isLogged').mockReturnValue(of(true));

      // ACT
      fixture.detectChanges();

      // GET HTML ELEMENTS
      const logoutBtn = getByDataTest(
        fixture,
        'logout-btn'
      ) as HTMLButtonElement;
      const registerMenuEl = getByDataTest(fixture, 'notLogged') as HTMLElement;

      // ASSERT
      expect(logoutBtn).not.toBeNull();
      expect(registerMenuEl).toBeNull();
    });

    it('should not display logOut button if not logged, and display register menu', () => {
      // ARRANGE
      jest.spyOn(sessionService, '$isLogged').mockReturnValue(of(false));

      // ACT
      fixture.detectChanges();

      // GET HTML ELEMENTS
      const logoutBtn = getByDataTest(
        fixture,
        'logout-btn'
      ) as HTMLButtonElement;
      const registerMenuEl = getByDataTest(fixture, 'notLogged') as HTMLElement;

      // ASSERT
      expect(logoutBtn).toBeNull();
      expect(registerMenuEl).not.toBeNull();
    });

    it('should logOut the user, navigate to Home Page and hide the register menu when logOut button is clicked', fakeAsync(() => {
      // ARRANGE
      sessionService.logIn(mockSessionInformation);

      fixture.detectChanges();
      tick();

      // GET HTML ELEMENTS
      const logoutBtn = getByDataTest(
        fixture,
        'logout-btn'
      ) as HTMLButtonElement;

      // ACT
      logoutBtn.click();
      fixture.detectChanges();
      tick();

      // ASSERT
      const registerMenuEl = getByDataTest(fixture, 'notLogged') as HTMLElement;
      expect(registerMenuEl).not.toBeNull();

      const loggedMenuEl = getByDataTest(fixture, 'isLogged');
      expect(loggedMenuEl).toBeNull();

      // ASSERT LOCATION
      expect(location.path()).toBe('/');
    }));
  });
});
