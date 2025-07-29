package com.openclassrooms.starterjwt.unit.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.aspectj.lang.annotation.Before;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapperImpl;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;

@ExtendWith(MockitoExtension.class)
public class SessionMapperTests {

    @Mock
    UserService userService;

    @Mock
    TeacherService teacherService;

    @InjectMocks
    SessionMapperImpl sessionMapperImpl;

    private Session session;
    private Session sessionWithNoUsers;
    private SessionDto sessionDto;
    private SessionDto sessionDtoWithNoUsers;
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

        sessionWithNoUsers = Session.builder()
                .id(1L)
                .name("a session")
                .date(sessionDate)
                .description("description")
                .teacher(teacher)
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

        sessionDtoWithNoUsers = new SessionDto(
                1L,
                "a session",
                sessionDate,
                teacher.getId(),
                "description",
                null,
                createdAt,
                updatedAt);

        sessions = List.of(session);
        sessionDtos = List.of(sessionDto);
    }

    @Test
    public void SessionMapper_toEntity_ShouldReturnSession() {
        // ARRANGE
        when(teacherService.findById(sessionDto.getTeacher_id())).thenReturn(teacher);
        when(userService.findById(sessionDto.getUsers().get(0))).thenReturn(user);

        // ACT
        Session sessionFromMapper = sessionMapperImpl.toEntity(sessionDto);

        // ASSERT
        assertThat(sessionFromMapper.getId()).isEqualTo(sessionDto.getId());
        assertThat(sessionFromMapper.getName()).isEqualTo(sessionDto.getName());
        assertThat(sessionFromMapper.getTeacher().getId()).isEqualTo(teacher.getId());
        assertThat(sessionFromMapper.getDescription()).isEqualTo(sessionDto.getDescription());
        assertThat(sessionFromMapper.getUsers().get(0).getId()).isEqualTo(user.getId());
        assertThat(sessionFromMapper.getCreatedAt()).isEqualTo(sessionDto.getCreatedAt());
        assertThat(sessionFromMapper.getUpdatedAt()).isEqualTo(sessionDto.getUpdatedAt());
    }

    @Test
    public void SessionMapper_toEntity_ShouldReturnSessionWithTeacherNull() {
        // ARRANGE
        when(teacherService.findById(sessionDto.getTeacher_id())).thenReturn(null);
        when(userService.findById(sessionDto.getUsers().get(0))).thenReturn(user);

        // ACT
        Session sessionFromMapper = sessionMapperImpl.toEntity(sessionDto);

        // ASSERT
        assertThat(sessionFromMapper.getId()).isEqualTo(sessionDto.getId());
        assertThat(sessionFromMapper.getName()).isEqualTo(sessionDto.getName());
        assertThat(sessionFromMapper.getTeacher()).isNull();
        assertThat(sessionFromMapper.getDescription()).isEqualTo(sessionDto.getDescription());
        assertThat(sessionFromMapper.getUsers().get(0).getId()).isEqualTo(user.getId());
        assertThat(sessionFromMapper.getCreatedAt()).isEqualTo(sessionDto.getCreatedAt());
        assertThat(sessionFromMapper.getUpdatedAt()).isEqualTo(sessionDto.getUpdatedAt());
    }

    @Test
    public void SessionMapper_toEntity_ShouldReturnSessionWithUsersNull() {
        // ARRANGE
        when(teacherService.findById(sessionDto.getTeacher_id())).thenReturn(teacher);
        when(userService.findById(sessionDto.getUsers().get(0))).thenReturn(null);

        // ACT
        Session sessionFromMapper = sessionMapperImpl.toEntity(sessionDto);

        // ASSERT
        assertThat(sessionFromMapper.getId()).isEqualTo(sessionDto.getId());
        assertThat(sessionFromMapper.getName()).isEqualTo(sessionDto.getName());
        assertThat(sessionFromMapper.getTeacher().getId()).isEqualTo(teacher.getId());
        assertThat(sessionFromMapper.getDescription()).isEqualTo(sessionDto.getDescription());
        assertThat(sessionFromMapper.getUsers().get(0)).isNull();
        assertThat(sessionFromMapper.getCreatedAt()).isEqualTo(sessionDto.getCreatedAt());
        assertThat(sessionFromMapper.getUpdatedAt()).isEqualTo(sessionDto.getUpdatedAt());
    }

    @Test
    public void SessionMapper_toEntity_ShouldReturnSessionWithEmptyUsers() {
        // ARRANGE
        when(teacherService.findById(sessionDtoWithNoUsers.getTeacher_id())).thenReturn(teacher);

        // ACT
        Session sessionFromMapper = sessionMapperImpl.toEntity(sessionDtoWithNoUsers);

        // ASSERT
        assertThat(sessionFromMapper.getId()).isEqualTo(sessionDtoWithNoUsers.getId());
        assertThat(sessionFromMapper.getName()).isEqualTo(sessionDtoWithNoUsers.getName());
        assertThat(sessionFromMapper.getTeacher().getId()).isEqualTo(teacher.getId());
        assertThat(sessionFromMapper.getDescription()).isEqualTo(sessionDtoWithNoUsers.getDescription());
        assertThat(sessionFromMapper.getUsers()).isEmpty();
        assertThat(sessionFromMapper.getCreatedAt()).isEqualTo(sessionDtoWithNoUsers.getCreatedAt());
        assertThat(sessionFromMapper.getUpdatedAt()).isEqualTo(sessionDtoWithNoUsers.getUpdatedAt());
    }

    @Test
    public void SessionMapper_toEntity_ShouldReturnNull() {
        // ACT
        Session sessionFromMapper = sessionMapperImpl.toEntity((SessionDto) null);

        // ASSERT
        assertThat(sessionFromMapper).isNull();
    }

    @Test
    public void SessionMapper_toEntity_ShouldReturnAListOfSession() {
        // ARRANGE
        when(teacherService.findById(sessionDto.getTeacher_id())).thenReturn(teacher);
        when(userService.findById(sessionDto.getUsers().get(0))).thenReturn(user);

        // ACT
        List<Session> sessionsFromMapper = sessionMapperImpl.toEntity(sessionDtos);

        // ASSERT
        assertThat(sessionsFromMapper.size()).isGreaterThan(0);
        assertThat(sessionsFromMapper).hasSize(sessionDtos.size());
        assertThat(sessionsFromMapper.get(0).getName()).isEqualTo(sessionDto.getName());
        assertThat(sessionsFromMapper.get(0).getTeacher().getId()).isEqualTo(teacher.getId());
    }

    @Test
    public void SessionMapper_toEntity_ShouldReturnAListNull() {
        // ACT
        List<SessionDto> listNull = null;
        List<Session> sessionsFromMapper = sessionMapperImpl.toEntity(listNull);

        // ASSERT
        assertThat(sessionsFromMapper).isNull();
    }

    @Test
    public void SessionMapper_toDto_ShouldReturnSessionDto() {
        // ACT
        SessionDto sessionDtoFromMapper = sessionMapperImpl.toDto(session);

        // ASSERT
        assertThat(sessionDtoFromMapper.getId()).isEqualTo(session.getId());
        assertThat(sessionDtoFromMapper.getName()).isEqualTo(session.getName());
        assertThat(sessionDtoFromMapper.getTeacher_id()).isEqualTo(session.getTeacher().getId());
        assertThat(sessionDtoFromMapper.getDescription()).isEqualTo(session.getDescription());
        assertThat(sessionDtoFromMapper.getUsers().get(0)).isEqualTo(session.getUsers().get(0).getId());
        assertThat(sessionDtoFromMapper.getCreatedAt()).isEqualTo(session.getCreatedAt());
        assertThat(sessionDtoFromMapper.getUpdatedAt()).isEqualTo(session.getUpdatedAt());
    }

    @Test
    public void SessionMapper_toDto_ShouldReturnSessionWithEmptyUsers() {
        // ACT
        SessionDto sessionDtoFromMapper = sessionMapperImpl.toDto(sessionWithNoUsers);

        // ASSERT
        assertThat(sessionDtoFromMapper.getId()).isEqualTo(sessionWithNoUsers.getId());
        assertThat(sessionDtoFromMapper.getName()).isEqualTo(sessionWithNoUsers.getName());
        assertThat(sessionDtoFromMapper.getTeacher_id()).isEqualTo(sessionWithNoUsers.getTeacher().getId());
        assertThat(sessionDtoFromMapper.getDescription()).isEqualTo(sessionWithNoUsers.getDescription());
        assertThat(sessionDtoFromMapper.getUsers()).isEmpty();
        assertThat(sessionDtoFromMapper.getCreatedAt()).isEqualTo(sessionWithNoUsers.getCreatedAt());
        assertThat(sessionDtoFromMapper.getUpdatedAt()).isEqualTo(sessionWithNoUsers.getUpdatedAt());
    }

    @Test
    public void SessionMapper_toDto_ShouldReturnNull() {
        // ACT
        SessionDto sessionDtoFromMapper = sessionMapperImpl.toDto((Session) null);

        // ASSERT
        assertThat(sessionDtoFromMapper).isNull();
    }

    @Test
    public void SessionMapper_toDto_ShouldReturnAListOfSession() {
        // ACT
        List<SessionDto> sessionDtosFromMapper = sessionMapperImpl.toDto(sessions);

        // ASSERT
        assertThat(sessionDtosFromMapper.size()).isGreaterThan(0);
        assertThat(sessionDtosFromMapper).hasSize(sessions.size());
        assertThat(sessionDtosFromMapper.get(0).getName()).isEqualTo(session.getName());
    }

    @Test
    public void SessionMapper_toDto_ShouldReturnAListNull() {
        // ACT
        List<Session> listNull = null;
        List<SessionDto> sessionDtosFromMapper = sessionMapperImpl.toDto(listNull);

        // ASSERT
        assertThat(sessionDtosFromMapper).isNull();
    }

}
