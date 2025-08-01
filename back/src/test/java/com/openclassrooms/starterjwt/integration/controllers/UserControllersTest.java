package com.openclassrooms.starterjwt.integration.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.integration.BaseIntegrationTest;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.services.UserService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.HashMap;
import java.util.Map;

@Tag("integration")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class UserControllersTest extends BaseIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    UserMapper userMapper;

    @Autowired
    UserService userService;

    @Autowired
    private TestRestTemplate testRestTemplate;

    @Autowired
    public ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

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
        Map<String, Object> authenticateUserMap = createAndAuthenticateTestUser();
        User user = (User) authenticateUserMap.get("user");

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
        Map<String, Object> authenticateUserMap = createAndAuthenticateTestUser();
        User user = (User) authenticateUserMap.get("user");
        String token = (String) authenticateUserMap.get("token");

        // set headers for http request
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
    }

}
