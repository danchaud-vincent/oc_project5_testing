package com.openclassrooms.starterjwt.unit.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.SessionService;

@ActiveProfiles("unit-test")
@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class SessionServiceTest {

    @Mock
    SessionRepository sessionRepository;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    SessionService sessionService;

    private Session session;
    private Session sessionWithUser;
    private List<Session> sessions;
    private User user;

    @BeforeEach
    public void init() {
        // Create a user
        user = User.builder()
                .id(1L)
                .email("user@email.com")
                .lastName("lastName")
                .firstName("firstName")
                .password("1234")
                .admin(false)
                .build();

        // create a session with no user
        session = Session.builder()
                .id(1L)
                .name("a session")
                .date(new Date())
                .description("description")
                .users(new ArrayList<User>())
                .build();

        // create a session with a user
        sessionWithUser = Session.builder()
                .id(1L)
                .name("a session")
                .date(new Date())
                .description("description")
                .users(new ArrayList<User>(List.of(user)))
                .build();

        // Create a list of session
        Session session1 = Session.builder()
                .name("a session")
                .date(new Date())
                .description("description")
                .users(new ArrayList<User>())
                .build();

        Session session2 = Session.builder()
                .name("a session")
                .date(new Date())
                .description("description")
                .users(new ArrayList<User>())
                .build();

        sessions = List.of(session1, session2);
    }

    @Test
    public void shouldSaveAndReturnASession_whenCreate() {
        // ARRANGE
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        // ACT
        Session sessionCreated = sessionService.create(session);

        // ASSERT
        verify(sessionRepository).save(any(Session.class));
        assertThat(sessionCreated.getName()).isEqualTo(session.getName());
        assertThat(sessionCreated.getDescription()).isEqualTo(session.getDescription());
    }

    @Test
    public void shouldDeleteASession_whenSessionExits() {
        // ARRANGE
        doNothing().when(sessionRepository).deleteById(anyLong());

        // ACT
        sessionService.delete(session.getId());

        // ASSERT
        verify(sessionRepository).deleteById(anyLong());
    }

    @Test
    public void shouldReturnAListOfSession_whenFindAll() {
        // ARRANGE
        when(sessionRepository.findAll()).thenReturn(sessions);

        // ACT
        List<Session> sessionsAll = sessionService.findAll();

        // ASSERT
        verify(sessionRepository).findAll();
        assertThat(sessionsAll.size()).isEqualTo(sessions.size());
    }

    @Test
    public void shouldReturnASession_whenSessionExists() {
        // ARRANGE
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.of(session));

        // ACT
        Session sessionFound = sessionService.getById(session.getId());

        // ASSERT
        verify(sessionRepository).findById(session.getId());
        assertThat(sessionFound.getName()).isEqualTo(session.getName());
    }

    @Test
    public void shouldReturnNull_whenNotFound() {
        // ARRANGE
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.empty());

        // ACT
        Session sessionFound = sessionService.getById(session.getId());

        // ASSERT
        verify(sessionRepository).findById(session.getId());
        assertThat(sessionFound).isNull();
    }

    @Test
    public void shouldReturnAnUpdatedSession_whenUpdate() {
        // ARRANGE
        Long sessionId = 2L;
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        // ACT
        Session sessionUpdated = sessionService.update(sessionId, session);

        // ASSERT
        verify(sessionRepository).save(session);
        assertThat(sessionUpdated).isNotNull();
        assertThat(sessionUpdated.getId()).isEqualTo(sessionId);
    }

    @Test
    public void shouldRegisterAUserToASession_whenUserParticipate() {
        // ARRANGE
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.of(session));
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        int userListSize = session.getUsers().size();

        // ACT
        sessionService.participate(session.getId(), user.getId());

        // ASSERT
        verify(sessionRepository).findById(session.getId());
        verify(userRepository).findById(user.getId());
        verify(sessionRepository).save(session);
        assertThat(session.getUsers().size()).isGreaterThan(userListSize);
    }

    @Test
    public void shouldReturnNotFoundException_whenUserOrSessionDoesntExists() {
        // ARRANGE : user empty, session empty
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.empty());
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(NotFoundException.class, () -> {
            sessionService.participate(session.getId(), user.getId());
        });

        // ASSERT
        verify(sessionRepository).findById(session.getId());
        verify(userRepository).findById(user.getId());
        verify(sessionRepository, times(0)).save(session);
    }

    @Test
    public void shouldReturnABadRequest_whenUserAlreadyParticipate() {
        // ARRANGE
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.of(sessionWithUser));
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));

        // ACT & ASSERT
        assertThrows(BadRequestException.class, () -> {
            sessionService.participate(sessionWithUser.getId(), user.getId());
        });

        // ASSERT
        verify(sessionRepository).findById(sessionWithUser.getId());
        verify(userRepository).findById(user.getId());
        verify(sessionRepository, times(0)).save(sessionWithUser);
    }

    @Test
    public void shouldUnsubscribeUserOfSession_whenUserNoLongerParticipate() {
        // ARRANGE
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.of(sessionWithUser));
        when(sessionRepository.save(any(Session.class))).thenReturn(sessionWithUser);
        int userListSize = sessionWithUser.getUsers().size();

        // ACT
        sessionService.noLongerParticipate(sessionWithUser.getId(), user.getId());

        // ASSERT
        verify(sessionRepository).findById(sessionWithUser.getId());
        verify(sessionRepository).save(sessionWithUser);
        assertThat(sessionWithUser.getUsers().size()).isLessThan(userListSize);
    }

    @Test
    public void shouldReturnNotFoundException_whenSessionNotExits() {
        // ARRANGE : session empty
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(NotFoundException.class, () -> {
            sessionService.noLongerParticipate(session.getId(), user.getId());
        });

        // ASSERT
        verify(sessionRepository, times(0)).save(session);
    }

    @Test
    public void shouldReturnBadRequestException_whenUserAlreadyNotParticipate() {
        // ARRANGE
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.of(session));

        // ACT & ASSERT
        assertThrows(BadRequestException.class, () -> {
            sessionService.noLongerParticipate(session.getId(), user.getId());
        });

        // ASSERT
        verify(sessionRepository, times(0)).save(session);
    }
}
