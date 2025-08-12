package com.openclassrooms.starterjwt.integration.controllers;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Date;
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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.integration.BaseIntegrationIT;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;

@Tag("integration")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class SessionControllerTest extends BaseIntegrationIT {

    @Autowired
    private TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRepository sessionRepository;

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
    private Session session;
    private Teacher teacher;

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
        // Create user and authenticate
        Map<String, Object> authenticateUserMap = createAndAuthenticateTestUser();
        user = (User) authenticateUserMap.get("user");
        token = (String) authenticateUserMap.get("token");

        // Create session in db
        Teacher teacherBuild = Teacher.builder()
                .lastName("teacher1LastName")
                .firstName("teacher1FirstName")
                .build();

        teacher = teacherRepository.saveAndFlush(teacherBuild);

        Date sessionDate = new Date();

        Session sessionBuild = Session.builder()
                .name("a session")
                .date(sessionDate)
                .description("session description")
                .teacher(teacher)
                .build();

        session = sessionRepository.saveAndFlush(sessionBuild);
    }

    @AfterEach
    public void clean() {
        // Détacher les utilisateurs des sessions
        List<Session> sessions = sessionRepository.findAll();
        for (Session session : sessions) {
            session.getUsers().clear();
        }
        sessionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    public void findById_shouldReturn200AndSessionDto_whenSessionExist() {
        // ARRANGE
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<SessionDto> response = testRestTemplate.exchange(
                "/api/session/" + session.getId(),
                HttpMethod.GET,
                entity,
                SessionDto.class);

        SessionDto sessionDtoDtoResponse = response.getBody();

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(sessionDtoDtoResponse.getDescription()).isEqualTo(session.getDescription());
        assertThat(sessionDtoDtoResponse.getName()).isEqualTo(session.getName());
        assertThat(sessionDtoDtoResponse.getDate()).isNotNull();
        assertThat(sessionDtoDtoResponse.getTeacher_id()).isEqualTo(session.getTeacher().getId());
    }

    @Test
    public void findById_shouldReturn404_whenSessionNotFound() {
        // ARRANGE
        Long sessionIdNotInDB = 999L;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/session/" + sessionIdNotInDB,
                HttpMethod.GET,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void findById_shouldReturn400_whenSessionIDNotValid() {
        // ARRANGE
        String sessionIdInvalid = "abc";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/session/" + sessionIdInvalid,
                HttpMethod.GET,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void create_shouldReturnOKAndNewSessionDto_whenNewSessionIsCreated() {
        // ARRANGE: create a new session and add to db
        SessionDto newSessionDto = new SessionDto();
        newSessionDto.setName("a session");
        newSessionDto.setDescription("description");
        newSessionDto.setDate(new Date());
        newSessionDto.setTeacher_id(teacher.getId());

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SessionDto> reqBodyWithHeaders = new HttpEntity<>(newSessionDto, headers);

        // ACT
        ResponseEntity<SessionDto> response = testRestTemplate.exchange(
                "/api/session",
                HttpMethod.POST,
                reqBodyWithHeaders,
                SessionDto.class);

        SessionDto sessionDtoResponse = response.getBody();

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(sessionRepository.findAll().size()).isGreaterThan(0);
        assertThat(sessionDtoResponse.getName()).isEqualTo(newSessionDto.getName());
        assertThat(sessionDtoResponse.getDescription()).isEqualTo(newSessionDto.getDescription());
    }

    @Test
    public void create_shouldReturn400_whenNewSessionDtoNotValid() {
        // ARRANGE: create a new session and add to db
        SessionDto newSessionDto = new SessionDto();
        newSessionDto.setName("");
        newSessionDto.setDescription(null);
        newSessionDto.setDate(new Date());
        newSessionDto.setTeacher_id(teacher.getId());

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SessionDto> reqBodyWithHeaders = new HttpEntity<>(newSessionDto, headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/session",
                HttpMethod.POST,
                reqBodyWithHeaders,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void update_shouldReturn200AndSessionDtoUpdated_whenSessionExists() {
        // ARRANGE: create a new session and add to db
        SessionDto updateSessionDto = new SessionDto();
        updateSessionDto.setName("new name");
        updateSessionDto.setDescription("new description");
        updateSessionDto.setDate(new Date());
        updateSessionDto.setTeacher_id(teacher.getId());

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SessionDto> reqBodyWithHeaders = new HttpEntity<>(updateSessionDto, headers);

        // ACT
        ResponseEntity<SessionDto> response = testRestTemplate.exchange(
                "/api/session/" + session.getId(),
                HttpMethod.PUT,
                reqBodyWithHeaders,
                SessionDto.class);

        SessionDto sessionDtoResponse = response.getBody();

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(sessionDtoResponse.getName()).isEqualTo(updateSessionDto.getName());
        assertThat(sessionDtoResponse.getDescription()).isEqualTo(updateSessionDto.getDescription());
    }

    @Test
    public void update_shouldReturn400_whenSessionIdNotValid() {
        // ARRANGE: create a new session and add to db
        String sessionIdNotValid = "abc";

        SessionDto updateSessionDto = new SessionDto();
        updateSessionDto.setName("new name");
        updateSessionDto.setDescription("new description");
        updateSessionDto.setDate(new Date());
        updateSessionDto.setTeacher_id(teacher.getId());

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SessionDto> reqBodyWithHeaders = new HttpEntity<>(updateSessionDto, headers);

        // ACT
        ResponseEntity<SessionDto> response = testRestTemplate.exchange(
                "/api/session/" + sessionIdNotValid,
                HttpMethod.PUT,
                reqBodyWithHeaders,
                SessionDto.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void delete_shouldReturn200_whenSessionExists() {
        // ARRANGE
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/session/" + session.getId(),
                HttpMethod.DELETE,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(sessionRepository.findAll().size()).isEqualTo(0);
    }

    @Test
    public void delete_shouldReturn404_whenSessionNotFound() {
        // ARRANGE
        Long sessionIdNotIdDB = 999L;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/session/" + sessionIdNotIdDB,
                HttpMethod.DELETE,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void delete_shouldReturn400_whenSessionIdNotValid() {
        // ARRANGE
        String sessionIdNotValid = "abc";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/session/" + sessionIdNotValid,
                HttpMethod.DELETE,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void participate_shouldReturn200_whenUserRegisterForSession() {
        // ARRANGE
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/session/" + session.getId() + "/participate/" + user.getId(),
                HttpMethod.POST,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void participate_shouldReturn400_whenIdsNotValid() {
        // ARRANGE
        String sessionIdNotValid = "abc";
        String userIdsNotValid = "abc";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/session/" + sessionIdNotValid + "/participate/" + userIdsNotValid,
                HttpMethod.POST,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void noLongerparticipate_shouldReturn200_whenUserRegisterThenUnSubscribeForSession() {
        // ARRANGE
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/session/" + session.getId() + "/participate/" + user.getId(),
                HttpMethod.POST,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        // ACT
        ResponseEntity<String> responseNoLonger = testRestTemplate.exchange(
                "/api/session/" + session.getId() + "/participate/" + user.getId(),
                HttpMethod.DELETE,
                entity,
                String.class);

        // ASSERT
        assertThat(responseNoLonger.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void boLongerparticipate_shouldReturn400_whenIdsNotValid() {
        // ARRANGE
        String sessionIdNotValid = "abc";
        String userIdsNotValid = "abc";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/session/" + sessionIdNotValid + "/participate/" + userIdsNotValid,
                HttpMethod.DELETE,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

}
