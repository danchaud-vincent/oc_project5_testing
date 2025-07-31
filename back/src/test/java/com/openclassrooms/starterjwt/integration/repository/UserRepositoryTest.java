package com.openclassrooms.starterjwt.integration.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.openclassrooms.starterjwt.integration.BaseIntegrationTest;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;

public class UserRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    private User createTestUser() {
        User user = User.builder()
                .email("user@email.com")
                .lastName("lastName")
                .firstName("firstName")
                .password("1234")
                .admin(false)
                .build();

        // ARRANGE : save user in db
        return userRepository.save(user);
    }

    @Test
    public void shouldSaveAndReturnUser_whenUserIsSaved() {
        // ARRANGE & ACT
        User user = createTestUser();

        // ASSERT
        assertThat(user).isNotNull();
        assertThat(user.getId()).isGreaterThan(0);
    }

    @Test
    public void shouldReturnUser_whenUserFoundById() {
        // ARRANGE
        User user = createTestUser();

        // ACT
        Optional<User> userFound = userRepository.findById(user.getId());

        // ASSERT
        assertThat(userFound).isPresent();
        assertThat(userFound.get().getEmail()).isEqualTo(user.getEmail());
    }

    @Test
    public void shouldReturnUser_whenUserFoundByEmail() {
        // ARRANGE
        User user = createTestUser();

        // ACT
        Optional<User> userFoundByEmail = userRepository.findByEmail(user.getEmail());

        // ASSERT
        assertThat(userFoundByEmail).isPresent();
        assertThat(userFoundByEmail.get().getEmail()).isEqualTo(user.getEmail());
    }

    @Test
    public void shouldReturnTrue_whenUserExistsByEmail() {
        // ARRANGE
        User user = createTestUser();

        // ACT
        Boolean userExists = userRepository.existsByEmail(user.getEmail());

        // ASSERT
        assertThat(userExists).isTrue();
    }

    @Test
    public void shouldDeleteUser_whenUserExists() {
        // ARRANGE
        User user = createTestUser();

        // ACT
        userRepository.deleteById(user.getId());

        // ASSERT
        assertThat(userRepository.findById(user.getId())).isEmpty();
    }

}
