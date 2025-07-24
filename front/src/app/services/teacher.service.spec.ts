import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  const mockTeachers: Teacher[] = [
    {
      id: 1,
      lastName: 'teacher1',
      firstName: 'teacher1',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: 2,
      lastName: 'teacher2',
      firstName: 'teacher2',
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Teacher Suite Test', () => {
    it('should return a list of teacher', (done) => {
      // ACT
      service.all().subscribe((response) => {
        expect(response).toEqual(mockTeachers);
        done();
      });

      const req = httpMock.expectOne(`api/teacher`);

      // ASSERT
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);
    });

    it('should return a teacher', (done) => {
      // ARRANGE
      const mockTeacher: Teacher = mockTeachers[0];

      // ACT
      service.detail(mockTeacher.id.toString()).subscribe((response) => {
        expect(response).toEqual(mockTeacher);
        done();
      });

      const req = httpMock.expectOne(`api/teacher/${mockTeacher.id}`);

      // ASSERT
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher);
    });
  });
});
