import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';

import { AppComponent } from './app.component';
import { of } from 'rxjs';
import { SessionService } from './services/session.service';
import { Router } from '@angular/router';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let router: Router;

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

    it('should call sessionService.logOut and navigate to', () => {
      // ARRANGE
      const spyNavigate = jest.spyOn(router, 'navigate');

      // ACT
      app.logout();

      // ASSERT
      expect(mockSessionService.logOut).toHaveBeenCalled();
      expect(spyNavigate).toHaveBeenCalledWith(['']);
    });
  });
});
