package com.openclassrooms.starterjwt.integration.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

import com.openclassrooms.starterjwt.integration.BaseIntegrationTest;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;

@DataJpaTest
@Transactional
public class TeacherRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private TeacherRepository teacherRepository;

    private Teacher createTestTeacher() {
        // ARRANGE
        Teacher teacher = Teacher.builder()
                .lastName("lastNameTeacher")
                .firstName("firstNameTeacher")
                .build();

        // save the teacher in db
        return teacherRepository.save(teacher);
    }

    @Test
    public void shouldSaveAndReturnTeacher_whenTeacherSaved() {
        // ARRANGE & ACT
        Teacher teacher = createTestTeacher();

        // ASSERT
        assertThat(teacher).isNotNull();
        assertThat(teacher.getId()).isGreaterThan(0);
    }

    @Test
    public void shouldReturnTeacher_whenTeacherFoundById() {
        // ARRANGE
        Teacher teacher = createTestTeacher();

        // ACT
        Optional<Teacher> teacherFound = teacherRepository.findById(teacher.getId());

        // ASSERT
        assertThat(teacherFound).isPresent();
        assertThat(teacherFound.get().getLastName()).isEqualTo(teacher.getLastName());
    }

    @Test
    public void shouldReturnAListOfTeachers_whenFindAll() {
        // ARRANGE
        createTestTeacher();

        // ACT
        List<Teacher> teachers = teacherRepository.findAll();

        // ASSERT
        assertThat(teachers.size()).isGreaterThan(0);
    }

}
