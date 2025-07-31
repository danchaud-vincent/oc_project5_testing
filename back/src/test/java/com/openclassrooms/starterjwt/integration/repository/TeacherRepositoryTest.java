package com.openclassrooms.starterjwt.integration.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.openclassrooms.starterjwt.integration.BaseIntegrationTest;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;

public class TeacherRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private TeacherRepository teacherRepository;

    Teacher teacher;
    Teacher teacherSaved;

    @BeforeEach
    public void init() {
        // ARRANGE
        teacher = Teacher.builder()
                .lastName("lastNameTeacher")
                .firstName("firstNameTeacher")
                .build();

        // save the teacher in db
        teacherSaved = teacherRepository.save(teacher);
    }

    @AfterEach
    public void clean() {
        teacherRepository.deleteAll();
    }

    @Test
    public void shouldSaveAndReturnTeacher_whenTeacherSaved() {
        // ASSERT
        assertThat(teacherSaved).isNotNull();
        assertThat(teacherSaved.getId()).isGreaterThan(0);
    }

    @Test
    public void shouldReturnTeacher_whenTeacherFoundById() {
        // ACT
        Optional<Teacher> teacherFound = teacherRepository.findById(teacher.getId());

        // ASSERT
        assertThat(teacherFound).isPresent();
        assertThat(teacherFound.get().getLastName()).isEqualTo(teacher.getLastName());
    }

    @Test
    public void shouldReturnAListOfTeachers_whenFindAll() {
        // ACT
        List<Teacher> teachers = teacherRepository.findAll();

        // ASSERT
        assertThat(teachers.size()).isGreaterThan(0);
    }

}
