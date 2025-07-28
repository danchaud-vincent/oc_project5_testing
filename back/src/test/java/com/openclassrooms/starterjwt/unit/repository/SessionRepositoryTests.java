package com.openclassrooms.starterjwt.unit.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;

@DataJpaTest
@ActiveProfiles("unit-test")
@Tag("unit")
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
public class SessionRepositoryTests {

    @Autowired
    private SessionRepository sessionRepository;

    private Session session;
    private Session sessionSaved;

    @BeforeEach
    public void init() {
        // ARRANGE
        session = Session.builder()
                .name("a session")
                .date(new Date())
                .description("description")
                .build();

        sessionSaved = sessionRepository.save(session);
    }

    @Test
    public void SessionRepo_save_ShouldSaveAndReturnSession() {
        // ASSERT
        assertThat(sessionSaved).isNotNull();
        assertThat(sessionSaved.getId()).isGreaterThan(0);
    }

    @Test
    public void SessionRepo_findAll_ShouldReturnAListOfSession() {
        // ACT
        List<Session> sessions = sessionRepository.findAll();

        // ASSERT
        assertThat(sessions.size()).isGreaterThan(0);
    }

    @Test
    public void SessionRepo_findById_ShouldReturnSessionFound() {
        // ACT
        Optional<Session> sessionFound = sessionRepository.findById(session.getId());

        // ASSERT
        assertThat(sessionFound).isPresent();
        assertThat(sessionFound.get().getName()).isEqualTo(session.getName());
    }

    @Test
    public void SessionRepo_deleteById_ShouldDeleteASession() {
        // ACT
        sessionRepository.deleteById(session.getId());

        // ASSERT
        assertThat(sessionRepository.findById(session.getId())).isEmpty();
    }
}
