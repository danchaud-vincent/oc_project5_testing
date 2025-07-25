package com.openclassrooms.starterjwt.unit.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;

@DataJpaTest
@ActiveProfiles("jpa-test")
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
public class UserRepositoryTests {

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

    @Test
    public void UserRepo_save_ShouldSaveAndReturnUser() {
        // ASSERT
        assertThat(userSaved).isNotNull();
        assertThat(userSaved.getId()).isGreaterThan(0);

        User userRetrevied = userRepository.findById(user.getId()).get();
        assertThat(userRetrevied.getEmail()).isEqualTo(user.getEmail());
    }

    @Test
    public void UserRepo_findById_ShouldReturnUserFound() {
        // ACT
        User userFound = userRepository.findById(user.getId()).get();

        // ASSERT
        assertThat(userFound).isNotNull();
        assertThat(userFound.getEmail()).isEqualTo(user.getEmail());
    }

    @Test
    public void UserRepo_findByEmail_ShouldReturnUserFound() {
        // ACT
        User userFoundByEmail = userRepository.findByEmail(user.getEmail()).get();

        // ASSERT
        assertThat(userFoundByEmail).isNotNull();
        assertThat(userFoundByEmail.getEmail()).isEqualTo(user.getEmail());
    }

    @Test
    public void UserRepo_existsByEmail_ShouldReturnABoolean() {
        // ACT
        Boolean userExists = userRepository.existsByEmail(user.getEmail());

        // ASSERT
        assertThat(userExists).isTrue();
    }

    @Test
    public void UserRepo_deleteById_ShouldDeleteUser() {
        // ACT
        userRepository.deleteById(user.getId());

        // ASSERT
        assertThat(userRepository.findById(user.getId())).isEmpty();
    }

}
