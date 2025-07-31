package com.openclassrooms.starterjwt.integration.controllers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.fasterxml.jackson.databind.ObjectMapper;
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

public class UserControllersTest extends BaseIntegrationTest {

    @Autowired
    UserMapper userMapper;

    @Autowired
    UserService userService;

    @Autowired
    public MockMvc mockMvc;

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

        userRepository.save(newUSer);

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
    public void shouldReturn404_whenNoToken() throws Exception {
        // ARRANGE
        Map<String, Object> authenticateUser = createAndAuthenticateTestUser();
        User user = (User) authenticateUser.get("user");

        // ACT
        ResultActions response = mockMvc.perform(get("/api/user/{id}", user.getId()));

        // ASSERT
        response.andExpect(status().isUnauthorized());
    }

    @Test
    public void shouldReturn200_whenUserFoundById() throws Exception {
        // ARRANGE
        Map<String, Object> authenticateUser = createAndAuthenticateTestUser();
        User user = (User) authenticateUser.get("user");
        String token = (String) authenticateUser.get("token");

        // ACT
        ResultActions response = mockMvc.perform(get("/api/user/{id}", user.getId())
                .header("Authorization", "Bearer " + token));

        // ASSERT
        response.andExpect(status().isOk());
    }

}
