package com.openclassrooms.starterjwt.integration.controllers;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.openclassrooms.starterjwt.integration.BaseIntegrationIT;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;

@Tag("integration")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AuthControllerTest extends BaseIntegrationIT {

    @Autowired
    private TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @AfterEach
    public void clean() {
        userRepository.deleteAll();
    }

    @Test
    public void login_shouldReturnOKAndJwtResponse_whenUserAuthenticate() {
        // ARRANGE
        String userEmail = "yoga@studio.com";
        String userPassword = "test!1234";

        User newUSer = User.builder()
                .email(userEmail)
                .lastName("userLastName")
                .firstName("userFirstName")
                .password(bCryptPasswordEncoder.encode(userPassword))
                .admin(true)
                .build();

        userRepository.saveAndFlush(newUSer);

        // create signUp request
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(userEmail);
        loginRequest.setPassword(userPassword);

        // ACT
        HttpEntity<LoginRequest> entity = new HttpEntity<>(loginRequest);

        ResponseEntity<JwtResponse> response = testRestTemplate.postForEntity(
                "/api/auth/login",
                entity,
                JwtResponse.class);

        JwtResponse responseJwt = response.getBody();

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void register_shouldReturnOKAndMessage_whenUserRegisterSuccessfully() {
        // ARRANGE: add user to db
        String userEmail = "yoga@studio.com";
        String userPassword = "test!1234";

        // create signUp request
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail(userEmail);
        signupRequest.setPassword(userPassword);
        signupRequest.setFirstName("userFirstName");
        signupRequest.setLastName("userLastName");

        // ACT
        HttpEntity<SignupRequest> entity = new HttpEntity<>(signupRequest);

        ResponseEntity<String> response = testRestTemplate.postForEntity(
                "/api/auth/register",
                entity,
                String.class);

        String responseString = response.getBody();

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(responseString).contains("User registered successfully!");
        assertThat(userRepository.findAll().size()).isGreaterThan(0);
    }

    @Test
    public void register_shouldReturn400_whenEmailAlreadyExist() {
        // ARRANGE: add user to db
        String userEmail = "yoga@studio.com";
        String userPassword = "test!1234";

        User newUSer = User.builder()
                .email(userEmail)
                .lastName("userLastName")
                .firstName("userFirstName")
                .password(bCryptPasswordEncoder.encode(userPassword))
                .admin(true)
                .build();

        userRepository.saveAndFlush(newUSer);

        // create login request
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail(userEmail);
        signupRequest.setPassword(userPassword);
        signupRequest.setFirstName("userFirstName");
        signupRequest.setLastName("userLastName");

        // ACT
        HttpEntity<SignupRequest> entity = new HttpEntity<>(signupRequest);

        ResponseEntity<String> response = testRestTemplate.postForEntity(
                "/api/auth/register",
                entity,
                String.class);

        String responseString = response.getBody();

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

}
