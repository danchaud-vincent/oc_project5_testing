package com.openclassrooms.starterjwt.unit.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.openclassrooms.starterjwt.controllers.AuthController;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.payload.response.MessageResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;

@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    AuthenticationManager authenticationManager;

    @Mock
    JwtUtils jwtUtils;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    SecurityContext securityContext;

    @Mock
    Authentication authentication;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    AuthController authController;

    private User user;
    private UserDetailsImpl userDetailsImpl;
    private JwtResponse jwtResponse;
    private String token = "";

    @BeforeEach
    public void init() {
        String userEmail = "user@email.com";
        String userPassword = "1234";
        String userLastName = "userLastName";
        String userFirstName = "userFirstName";

        LocalDateTime createdAt = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2025, 2, 2, 0, 0, 0);

        user = User.builder()
                .id(1L)
                .email(userEmail)
                .lastName(userLastName)
                .firstName(userFirstName)
                .password(userPassword)
                .admin(false)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();

        userDetailsImpl = UserDetailsImpl.builder()
                .id(1L)
                .username(userEmail)
                .lastName(userLastName)
                .firstName(userFirstName)
                .admin(false)
                .password(userPassword)
                .build();

        jwtResponse = new JwtResponse(
                token,
                1L,
                userEmail,
                userFirstName,
                userLastName,
                false);

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    public void clean() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void authenticateUser_shouldReturnJwtReponse_whenUserAuthenticate() {
        // ARRANGE
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(user.getEmail());
        loginRequest.setPassword(user.getPassword());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn(token);
        when(authentication.getPrincipal()).thenReturn(userDetailsImpl);
        when(userRepository.findByEmail(userDetailsImpl.getUsername())).thenReturn(Optional.of(user));

        // ACT
        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        // ASSERT
        JwtResponse actualResponse = (JwtResponse) response.getBody();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        assertThat(actualResponse.getToken()).isEqualTo(jwtResponse.getToken());
        assertThat(actualResponse.getId()).isEqualTo(jwtResponse.getId());
        assertThat(actualResponse.getUsername()).isEqualTo(jwtResponse.getUsername());
        assertThat(actualResponse.getFirstName()).isEqualTo(jwtResponse.getFirstName());
        assertThat(actualResponse.getLastName()).isEqualTo(jwtResponse.getLastName());
        assertThat(actualResponse.getAdmin()).isEqualTo(jwtResponse.getAdmin());
    }

    @Test
    public void register_shouldSaveUserAndReturnMessage_whenUserNotAlreadyRegistered() {
        // ARRANGE
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail(user.getEmail());
        signupRequest.setFirstName(user.getFirstName());
        signupRequest.setLastName(user.getLastName());
        signupRequest.setPassword(user.getPassword());

        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(signupRequest.getPassword())).thenReturn("passwordEncoded");
        when(userRepository.save(any(User.class))).thenReturn(user);

        // ACT
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // ASSERT
        MessageResponse actualMessageResponse = (MessageResponse) response.getBody();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(actualMessageResponse.getMessage()).isEqualTo("User registered successfully!");
    }

    @Test
    public void register_shouldReturnBadRequest_whenUserAlreadyRegistered() {
        // ARRANGE
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail(user.getEmail());
        signupRequest.setFirstName(user.getFirstName());
        signupRequest.setLastName(user.getLastName());
        signupRequest.setPassword(user.getPassword());

        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(true);

        // ACT
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // ASSERT
        MessageResponse actualMessageResponse = (MessageResponse) response.getBody();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(actualMessageResponse.getMessage()).isEqualTo("Error: Email is already taken!");
    }

}
