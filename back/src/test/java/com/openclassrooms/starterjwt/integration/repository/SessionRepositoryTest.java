package com.openclassrooms.starterjwt.integration.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.openclassrooms.starterjwt.integration.BaseIntegrationTest;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.repository.SessionRepository;

public class SessionRepositoryTest extends BaseIntegrationTest {

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

    @AfterEach
    public void clean() {
        sessionRepository.deleteAll();
    }

    @Test
    public void shouldSaveAndReturnSession_whenSessionSaved() {
        // ASSERT
        assertThat(sessionSaved).isNotNull();
        assertThat(sessionSaved.getId()).isGreaterThan(0);
    }

    @Test
    public void shouldReturnAListOfSession_whenFindAll() {
        // ACT
        List<Session> sessions = sessionRepository.findAll();

        // ASSERT
        assertThat(sessions.size()).isGreaterThan(0);
    }

    @Test
    public void shouldReturnSession_whenSessionFoundById() {
        // ACT
        Optional<Session> sessionFound = sessionRepository.findById(session.getId());

        // ASSERT
        assertThat(sessionFound).isPresent();
        assertThat(sessionFound.get().getName()).isEqualTo(session.getName());
    }

    @Test
    public void shouldDeleteASession_whenSessionExists() {
        // ACT
        sessionRepository.deleteById(session.getId());

        // ASSERT
        assertThat(sessionRepository.findById(session.getId())).isEmpty();
    }
}
