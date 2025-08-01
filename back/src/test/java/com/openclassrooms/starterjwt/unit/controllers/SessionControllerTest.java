package com.openclassrooms.starterjwt.unit.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.openclassrooms.starterjwt.controllers.SessionController;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.SessionService;

@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class SessionControllerTest {

    @Mock
    SessionMapper sessionMapper;

    @Mock
    SessionService sessionService;

    @InjectMocks
    SessionController sessionController;

    private Session session;
    private SessionDto sessionDto;
    private List<Session> sessions;
    private List<SessionDto> sessionDtos;
    private User user;
    private Teacher teacher;

    @BeforeEach
    public void init() {
        LocalDateTime createdAt = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2025, 2, 2, 0, 0, 0);
        Date sessionDate = new Date();

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

        List<User> users = List.of(user);
        List<Long> userIds = List.of(user.getId());

        teacher = Teacher.builder()
                .id(1L)
                .lastName("lastNameTeacher")
                .firstName("firstNameTeacher")
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();

        session = Session.builder()
                .id(1L)
                .name("a session")
                .date(sessionDate)
                .description("description")
                .teacher(teacher)
                .users(users)
                .createdAt(createdAt).updatedAt(updatedAt)
                .build();

        sessionDto = new SessionDto(
                1L,
                "a session",
                sessionDate,
                teacher.getId(),
                "description",
                userIds,
                createdAt,
                updatedAt);

        sessions = List.of(session);
        sessionDtos = List.of(sessionDto);
    }

    @Test
    public void findById_shouldReturnSessionDto_whenSessionExists() {
        // ARRANGE
        when(sessionService.getById(session.getId())).thenReturn(session);
        when(sessionMapper.toDto(session)).thenReturn(sessionDto);

        // ACT
        ResponseEntity<?> response = sessionController.findById(session.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(sessionDto);
        verify(sessionService).getById(session.getId());
        verify(sessionMapper).toDto(session);
    }

    @Test
    public void findById_shouldReturnNotFound_whenSessionNotExists() {
        // ARRANGE
        when(sessionService.getById(session.getId())).thenReturn(null);

        // ACT
        ResponseEntity<?> response = sessionController.findById(session.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
        verify(sessionMapper, times(0)).toDto(session);
    }

    @Test
    public void findById_shouldReturnBadRequest_whenRequestWithBadNumberFormat() {
        // ACT
        ResponseEntity<?> response = sessionController.findById("abc");

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(sessionMapper, times(0)).toDto(session);
    }

    @Test
    public void findAll_shouldReturnListSessionDtos_whenListSessionsExist() {
        // ARRANGE
        when(sessionService.findAll()).thenReturn(sessions);
        when(sessionMapper.toDto(sessions)).thenReturn(sessionDtos);

        // ACT
        ResponseEntity<?> response = sessionController.findAll();

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(sessionService).findAll();
        verify(sessionMapper).toDto(sessions);
    }

    @Test
    public void create_shouldReturnSessionDto_whenRequestSuccessful() {
        // ARRANGE
        when(sessionMapper.toEntity(sessionDto)).thenReturn(session);
        when(sessionService.create(session)).thenReturn(session);
        when(sessionMapper.toDto(session)).thenReturn(sessionDto);

        // ACT
        ResponseEntity<?> response = sessionController.create(sessionDto);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(sessionDto);
        verify(sessionMapper).toEntity(sessionDto);
        verify(sessionService).create(session);
    }

    @Test
    public void update_shouldReturnSessionDto_whenSessionToUpdateExists() {
        // ARRANGE
        when(sessionService.update(sessionDto.getId(), session)).thenReturn(session);
        when(sessionMapper.toEntity(sessionDto)).thenReturn(session);
        when(sessionMapper.toDto(session)).thenReturn(sessionDto);

        // ACT
        ResponseEntity<?> response = sessionController.update(sessionDto.getId().toString(), sessionDto);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(sessionDto);
        verify(sessionMapper).toEntity(any(SessionDto.class));
        verify(sessionService).update(anyLong(), any(Session.class));
        verify(sessionMapper).toDto(any(Session.class));
    }

    @Test
    public void update_shouldReturnBadRequest_whenRequestWithBadNumberFormat() {
        // ACT
        ResponseEntity<?> response = sessionController.update("abc", sessionDto);

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void delete_shouldDeleteSession_whenSessionExist() {
        // ARRANGE
        when(sessionService.getById(session.getId())).thenReturn(session);
        doNothing().when(sessionService).delete(session.getId());

        // ACT
        ResponseEntity<?> response = sessionController.save(session.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(sessionService).getById(anyLong());
        verify(sessionService).delete(anyLong());
    }

    @Test
    public void delete_shouldReturnNotFound_whenSessionNotExists() {
        // ARRANGE
        when(sessionService.getById(session.getId())).thenReturn(null);

        // ACT
        ResponseEntity<?> response = sessionController.save(session.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(sessionService).getById(anyLong());
        verify(sessionService, times(0)).delete(anyLong());
    }

    @Test
    public void delete_shouldReturnBadRequest_whenRequestWithBadNumberFormat() {
        // ACT
        ResponseEntity<?> response = sessionController.save("abc");

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(sessionService, times(0)).delete(anyLong());
    }

    @Test
    public void participate_shouldReturnOK_whenIDsAreValid() {
        // ARRANGE
        doNothing().when(sessionService).participate(session.getId(), user.getId());

        // ACT
        ResponseEntity<?> response = sessionController.participate(session.getId().toString(), user.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void participate_shouldReturnBadRequest_whenIDsAreNotValid() {
        // ACT
        ResponseEntity<?> response = sessionController.participate("abc", "abc");

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void noLongerParticipate_shouldReturnOK_whenIDsAreValid() {
        // ARRANGE
        doNothing().when(sessionService).noLongerParticipate(session.getId(), user.getId());

        // ACT
        ResponseEntity<?> response = sessionController.noLongerParticipate(session.getId().toString(),
                user.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void noLongerParticipate_shouldReturnBadRequest_whenIDsAreNotValid() {
        // ACT
        ResponseEntity<?> response = sessionController.noLongerParticipate("abc", "abc");

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

}
