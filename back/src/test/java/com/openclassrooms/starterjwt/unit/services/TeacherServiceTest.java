package com.openclassrooms.starterjwt.unit.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.services.TeacherService;

@ActiveProfiles("unit-test")
@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private TeacherService teacherService;

    private List<Teacher> teachers;
    private Teacher teacher;

    @BeforeEach
    public void init() {
        // create a list of teachers
        Teacher teacher1 = Teacher.builder()
                .lastName("lastNameTeacher")
                .firstName("firstNameTeacher")
                .build();

        Teacher teacher2 = Teacher.builder()
                .lastName("lastNameTeacher")
                .firstName("firstNameTeacher")
                .build();

        teachers = List.of(teacher1, teacher2);

        // create a teacher
        teacher = Teacher.builder()
                .id(1L)
                .lastName("lastNameTeacher")
                .firstName("firstNameTeacher")
                .build();
    }

    @Test
    public void ShouldReturnAListOfTeachers_whenFindAll() {
        // ARRANGE
        when(teacherRepository.findAll()).thenReturn(teachers);

        // ACT
        List<Teacher> teachersReturn = teacherService.findAll();

        // ASSERT
        verify(teacherRepository).findAll();
        assertThat(teachersReturn.size()).isEqualTo(teachers.size());
    }

    @Test
    public void ShouldReturnATeacher_whenTeacherFindById() {
        // ARRANGE
        when(teacherRepository.findById(anyLong())).thenReturn(Optional.of(teacher));

        // ACT
        Teacher teacherFound = teacherService.findById(teacher.getId());

        // ASSERT
        verify(teacherRepository).findById(teacher.getId());
        assertThat(teacherFound.getLastName()).isEqualTo(teacher.getLastName());
    }

    @Test
    public void ShouldReturnNull_whenNoTeacherFound() {
        // ARRANGE
        when(teacherRepository.findById(anyLong())).thenReturn(Optional.empty());

        // ACT
        Teacher teacherFound = teacherService.findById(teacher.getId());

        // ASSERT
        verify(teacherRepository).findById(teacher.getId());
        assertThat(teacherFound).isNull();
    }

}
