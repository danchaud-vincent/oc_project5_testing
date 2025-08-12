package com.openclassrooms.starterjwt.integration.controllers;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.integration.BaseIntegrationIT;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Tag("integration")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class UserControllersIT extends BaseIntegrationIT {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    private User user;
    private String token;

    @BeforeEach
    public void init() {
        Map<String, Object> authenticateUserMap = createAndAuthenticateTestUser();
        user = (User) authenticateUserMap.get("user");
        token = (String) authenticateUserMap.get("token");
    }

    @AfterEach
    public void clean() {
        userRepository.deleteAll();
    }

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

    @Test
    public void findById_shouldReturn401_whenRequestWithoutToken() throws Exception {
        // ARRANGE
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "");
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/user/" + user.getId(),
                HttpMethod.GET,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void findById_shouldReturn200AndUSerDto_whenRequestWithValidToken() {
        // ARRANGE
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<UserDto> response = testRestTemplate.exchange(
                "/api/user/" + user.getId(),
                HttpMethod.GET,
                entity,
                UserDto.class);

        UserDto responseUserDto = response.getBody();

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(responseUserDto.getEmail()).isEqualTo(user.getEmail());
        assertThat(responseUserDto.getFirstName()).isEqualTo(user.getFirstName());
        assertThat(responseUserDto.getLastName()).isEqualTo(user.getLastName());
        assertThat(responseUserDto.isAdmin()).isEqualTo(user.isAdmin());
    }

    @Test
    public void findById_shouldReturn404_whenUserIdNotInDatabase() {
        // ARRANGE
        Long userIdNotInDB = 999L;

        // set headers for http request
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/user/" + userIdNotInDB,
                HttpMethod.GET,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void findById_shouldReturn400_whenRequestWithInvalidID() {
        // ARRANGE
        String invalidID = "abc";

        // set headers for http request
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/user/" + invalidID,
                HttpMethod.GET,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void delete_shouldReturn200_whenUserIsDeleted() {
        // set headers for http request
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/user/" + user.getId(),
                HttpMethod.DELETE,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(userRepository.findAll().size()).isEqualTo(0);
    }

    @Test
    public void delete_shouldReturn404_whenUserNotFound() {
        // ARRANGE
        Long userIdNotInDB = 999L;

        // set headers for http request
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/user/" + userIdNotInDB,
                HttpMethod.DELETE,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(userRepository.findAll().size()).isGreaterThan(0);
    }

    @Test
    public void delete_shouldReturn400_whenIdNotValid() {
        // ARRANGE
        String idInvalid = "abc";

        // set headers for http request
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/user/" + idInvalid,
                HttpMethod.DELETE,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void delete_shouldReturn401_whenAUserWantToDeleteAnotherUser() {
        // ARRANGE: add another user in db
        User otherUser = User.builder()
                .email("otherUser@email.com")
                .lastName("otherUserLastName")
                .firstName("otherUserFirstName")
                .password(bCryptPasswordEncoder.encode("otherPassword"))
                .admin(true)
                .build();

        userRepository.saveAndFlush(otherUser);
        Optional<User> otherUserDB = userRepository.findByEmail(otherUser.getEmail());

        // set headers for http request
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // ACT : try to delete the otherUser with the token of the user already
        // connected
        ResponseEntity<String> response = testRestTemplate.exchange(
                "/api/user/" + otherUserDB.get().getId(),
                HttpMethod.DELETE,
                entity,
                String.class);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
