package com.openclassrooms.starterjwt.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertThat;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
public class MyIntegrationTest {

    @Container
    public static MySQLContainer<?> mySql = new MySQLContainer<>("mysql:8.0.33")
            .withDatabaseName("testdb")
            .withUsername("testUser")
            .withPassword("testPassword")
            .waitingFor(Wait.forListeningPort())
            .waitingFor(Wait.forLogMessage(".*ready for connections.*\\n", 1));

    @DynamicPropertySource
    static void overrideProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mySql::getJdbcUrl);
        registry.add("spring.datasource.username", mySql::getUsername);
        registry.add("spring.datasource.password", mySql::getPassword);
    }

    @Autowired
    private TeacherRepository teacherRepository;

    @Test
    void contextLoads() {
        System.out.println("URL MySQL: " + mySql.getJdbcUrl());
    }

    @Test
    @Tag("insert")
    void testInsertAndRetrieveTeacher() {
        Teacher teacher = new Teacher();
        teacher.setFirstName("Marie");
        teacher.setLastName("Curie");

        Teacher saved = teacherRepository.save(teacher);

        assertThat(saved.getId()).isNotNull();

        Teacher found = teacherRepository.findById(saved.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getFirstName()).isEqualTo("Marie");
        assertThat(found.getLastName()).isEqualTo("Curie");
    }

}
