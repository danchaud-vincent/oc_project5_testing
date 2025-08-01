package com.openclassrooms.starterjwt.unit.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.ArrayList;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.openclassrooms.starterjwt.controllers.UserController;
import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.UserService;

@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserMapper userMapper;

    @Mock
    SecurityContext securityContext;

    @Mock
    Authentication authentication;

    @InjectMocks
    private UserController userController;

    private User user;
    private UserDto userDto;

    @BeforeEach
    public void init() {
        LocalDateTime createdAt = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2025, 2, 2, 0, 0, 0);

        user = User.builder()
                .id(1L)
                .email("user@email.com")
                .lastName("lastName")
                .firstName("firstName")
                .password("1234")
                .admin(false)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();

        userDto = new UserDto(
                1L,
                "user@email.com",
                "lastName",
                "firstName",
                false,
                "1234",
                createdAt,
                updatedAt);

    }

    @Test
    public void findById_shouldReturnUserDto_whenRequestSuccessful() {
        // ARRANGE
        when(userService.findById(user.getId())).thenReturn(user);
        when(userMapper.toDto(user)).thenReturn(userDto);

        // ACT
        ResponseEntity<?> response = userController.findById(user.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(userDto);
        verify(userService).findById(anyLong());
        verify(userMapper).toDto(any(User.class));
    }

    @Test
    public void findById_shouldReturnNotFound_whenUserNotFound() {
        // ARRANGE
        when(userService.findById(user.getId())).thenReturn(null);

        // ACT
        ResponseEntity<?> response = userController.findById(user.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
        verify(userService).findById(anyLong());
    }

    @Test
    public void findById_shouldReturnBadRequest_whenRequestWithBadNumberFormat() {
        // ACT
        ResponseEntity<?> response = userController.findById("abc");

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void save_shouldDeleteAUser_whenUserExists() {
        // ARRANGE
        when(userService.findById(user.getId())).thenReturn(user);
        doNothing().when(userService).delete(user.getId());

        // create userdetails with user info
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>());

        // mock security context and authentication
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        SecurityContextHolder.setContext(securityContext);

        // ACT
        ResponseEntity<?> response = userController.save(user.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(userService).findById(user.getId());
        verify(userService).delete(user.getId());
    }

    @Test
    public void save_shouldReturnNotFound_whenUserNotExists() {
        // ARRANGE
        when(userService.findById(user.getId())).thenReturn(null);

        // ACT
        ResponseEntity<?> response = userController.save(user.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(userService).findById(anyLong());
        verify(userService, times(0)).delete(anyLong());
    }

    @Test
    public void save_shouldReturnUnauthorized_whenAuthenticatedUserIsDifferent() {
        // ARRANGE
        when(userService.findById(user.getId())).thenReturn(user);

        // create userdetails with user info
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "otherUSer@email.com",
                "otherPassword",
                new ArrayList<>());

        // mock security context and authentication
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        SecurityContextHolder.setContext(securityContext);

        // ACT
        ResponseEntity<?> response = userController.save(user.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(userService, times(0)).delete(anyLong());
    }

    @Test
    public void save_shouldReturnBadRequest_whenRequestWithBadNumberFormat() {
        // ACT
        ResponseEntity<?> response = userController.findById("abc");

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(userService, times(0)).delete(anyLong());
    }
}
