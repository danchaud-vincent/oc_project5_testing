package com.openclassrooms.starterjwt.integration.controllers;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.integration.BaseIntegrationIT;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.services.TeacherService;

@Tag("integration")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class TeacherControllerTest extends BaseIntegrationIT {

    @Autowired
    private TeacherMapper teacherMapper;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    private User user;
    private String token;
    private Teacher teacher1;
    private Teacher teacher2;

    private Map<String, Object> createAndAuthenticateTestUser() {
        String userEmail = "yoga@studio.com";
        String userPassword = "test!1234";

        // Add a user in the database
        User newUSer = User.builder()
                .email(userEmail)
                .lastName("userLastName")
                .firstName("userFirstName")
                .password(bCryptPasswordEncoder.encode(userPassword))
                .admin(true)
                .build();

        userRepository.saveAndFlush(newUSer);

        // Generate a token for the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userEmail, userPassword));

        String token = jwtUtils.generateJwtToken(authentication);

        // Create a map for the user
        Map<String, Object> authenticateUser = new HashMap<>();
        authenticateUser.put("user", newUSer);
        authenticateUser.put("token", token);

        return authenticateUser;
    }

    @BeforeEach
    public void init() {
        // Create a user and authenticate
        Map<String, Object> authenticateUserMap = createAndAuthenticateTestUser();
        user = (User) authenticateUserMap.get("user");
        token = (String) authenticateUserMap.get("token");

        // create two teachers in DB
        Teacher teacher1_build = Teacher.builder()
                .lastName("teacher1LastName")
                .firstName("teacher1FirstName")
                .build();

        Teacher teacher2_build = Teacher.builder()
                .lastName("teacher2LastName")
                .firstName("teacher2FirstName")
                .build();

        teacher1 = teacherRepository.saveAndFlush(teacher1_build);
        teacher2 = teacherRepository.saveAndFlush(teacher2_build);
    }

    @AfterEach
    public void clean() {
        userRepository.deleteAll();
        teacherRepository.deleteAll();
    }

    @Test
    public void findById_shoudlReturnOKAndTeacherDTO_whenTeacherExists() {
        // ARRANGE
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<TeacherDto> response = testRestTemplate.exchange(
                "/api/teacher/" + teacher1.getId(),
                HttpMethod.GET,
                entity,
                TeacherDto.class);

        TeacherDto teacherDtoResponse = response.getBody();

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(teacherDtoResponse.getFirstName()).isEqualTo(teacher1.getFirstName());
        assertThat(teacherDtoResponse.getLastName()).isEqualTo(teacher1.getLastName());
        assertThat(teacherDtoResponse.getCreatedAt()).isNotNull();
        assertThat(teacherDtoResponse.getUpdatedAt()).isNotNull();
    }

    @Test
    public void findById_shoudlReturn404_whenTeacherNotExists() {
        // ARRANGE
        Long teacherIdNotInDB = 999L;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/teacher/" + teacherIdNotInDB,
                HttpMethod.GET,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void findById_shoudlReturn400_whenTeacherIdNotValid() {
        // ARRANGE
        String teacherIdInvalid = "abc";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/teacher/" + teacherIdInvalid,
                HttpMethod.GET,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void findAll_shouldReturn200AndListOfTeacher_whenTeachersExist() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<List<Teacher>> response = testRestTemplate.exchange(
                "/api/teacher",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<List<Teacher>>() {
                });

        List<Teacher> teachersResponse = response.getBody();

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(teachersResponse.size()).isGreaterThan(0);
    }

}
