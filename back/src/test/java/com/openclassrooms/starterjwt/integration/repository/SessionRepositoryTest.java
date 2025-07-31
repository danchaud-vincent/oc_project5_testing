package com.openclassrooms.starterjwt.integration.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.openclassrooms.starterjwt.integration.BaseIntegrationTest;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.repository.SessionRepository;

@DataJpaTest
public class SessionRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private SessionRepository sessionRepository;

    private Session createTestSession() {
        Session session = Session.builder()
                .name("a session")
                .date(new Date())
                .description("description")
                .build();

        Session sessionSaved = sessionRepository.save(session);

        return sessionSaved;
    }

    @Test
    public void shouldSaveAndReturnSession_whenSessionSaved() {
        // ARRANGE
        Session session = createTestSession();

        // ASSERT
        assertThat(session).isNotNull();
        assertThat(session.getId()).isGreaterThan(0);
    }

    @Test
    public void shouldReturnAListOfSession_whenFindAll() {
        // ARRANGE
        createTestSession();

        // ACT
        List<Session> sessions = sessionRepository.findAll();

        // ASSERT
        assertThat(sessions.size()).isGreaterThan(0);
    }

    @Test
    public void shouldReturnSession_whenSessionFoundById() {
        // ARRANGE
        Session session = createTestSession();

        // ACT
        Optional<Session> sessionFound = sessionRepository.findById(session.getId());

        // ASSERT
        assertThat(sessionFound).isPresent();
        assertThat(sessionFound.get().getName()).isEqualTo(session.getName());
    }

    @Test
    public void shouldDeleteASession_whenSessionExists() {
        // ARRANGE
        Session session = createTestSession();

        // ACT
        sessionRepository.deleteById(session.getId());

        // ASSERT
        assertThat(sessionRepository.findById(session.getId())).isEmpty();
    }
}
