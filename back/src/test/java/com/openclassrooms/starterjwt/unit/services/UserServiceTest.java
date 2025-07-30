package com.openclassrooms.starterjwt.unit.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.UserService;

@ActiveProfiles("unit-test")
@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    public void init() {
        // ARRANGE
        user = User.builder()
                .id(1L)
                .email("user@email.com")
                .lastName("lastName")
                .firstName("firstName")
                .password("1234")
                .admin(false)
                .build();
    }

    @Test
    public void shouldDeleteUser_whenUserExists() {
        // ARANGE
        doNothing().when(userRepository).deleteById(user.getId());

        // ACT
        userService.delete(user.getId());

        // ASSERT
        verify(userRepository, times(1)).deleteById(user.getId());
    }

    @Test
    public void shouldReturnAUser_whenFindById() {
        // ARRANGE
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        // ACT
        User userFound = userService.findById(user.getId());

        // ASSERT
        verify(userRepository).findById(user.getId());
        assertThat(userFound.getEmail()).isEqualTo(user.getEmail());
    }

    @Test
    public void ShouldReturnNull_WhenNoUserFound() {
        // ARRANGE
        when(userRepository.findById(user.getId())).thenReturn(Optional.empty());

        // ACT
        User userFound = userService.findById(user.getId());

        // ASSERT
        verify(userRepository).findById(user.getId());
        assertThat(userFound).isNull();
    }

}
