package com.openclassrooms.starterjwt.integration.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.openclassrooms.starterjwt.integration.BaseIntegrationTest;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;

public class UserRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    private User user;
    private User userSaved;

    @BeforeEach
    public void init() {
        // ARRANGE
        user = User.builder()
                .email("user@email.com")
                .lastName("lastName")
                .firstName("firstName")
                .password("1234")
                .admin(false)
                .build();

        // ARRANGE : save user in db
        userSaved = userRepository.save(user);
    }

    @AfterEach
    public void clean() {
        userRepository.deleteAll();
    }

    @Test
    public void shouldSaveAndReturnUser_whenUserIsSaved() {
        // ASSERT
        assertThat(userSaved).isNotNull();
        assertThat(userSaved.getId()).isGreaterThan(0);
    }

    @Test
    public void shouldReturnUser_whenUserFoundById() {
        // ACT
        Optional<User> userFound = userRepository.findById(user.getId());

        // ASSERT
        assertThat(userFound).isPresent();
        assertThat(userFound.get().getEmail()).isEqualTo(user.getEmail());
    }

    @Test
    public void shouldReturnUser_whenUserFoundByEmail() {
        // ACT
        Optional<User> userFoundByEmail = userRepository.findByEmail(user.getEmail());

        // ASSERT
        assertThat(userFoundByEmail).isPresent();
        assertThat(userFoundByEmail.get().getEmail()).isEqualTo(user.getEmail());
    }

    @Test
    public void shouldReturnTrue_whenUserExistsByEmail() {
        // ACT
        Boolean userExists = userRepository.existsByEmail(user.getEmail());

        // ASSERT
        assertThat(userExists).isTrue();
    }

    @Test
    public void shouldDeleteUser_whenUserExists() {
        // ACT
        userRepository.deleteById(user.getId());

        // ASSERT
        assertThat(userRepository.findById(user.getId())).isEmpty();
    }

}
