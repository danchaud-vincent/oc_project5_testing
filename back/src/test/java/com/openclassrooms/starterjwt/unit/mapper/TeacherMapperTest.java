package com.openclassrooms.starterjwt.unit.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapperImpl;
import com.openclassrooms.starterjwt.models.Teacher;

@ActiveProfiles("unit-test")
@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class TeacherMapperTest {

    @InjectMocks
    private TeacherMapperImpl teacherMapperImpl;

    private Teacher teacher;
    private TeacherDto teacherDto;
    private List<Teacher> teachers;
    private List<TeacherDto> teacherDtos;

    @BeforeEach
    public void init() {
        LocalDateTime createdAt = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2025, 2, 2, 0, 0, 0);

        teacher = Teacher.builder()
                .id(1L)
                .lastName("lastNameTeacher")
                .firstName("firstNameTeacher")
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();

        teacherDto = new TeacherDto(
                1L,
                "lastNameTeacher",
                "firstNameTeacher",
                createdAt,
                updatedAt);

        teachers = List.of(teacher);
        teacherDtos = List.of(teacherDto);
    }

    @Test
    public void shouldReturnTeacherDto_whenToDto() {
        // ACT
        TeacherDto teacherDtoFromMapper = teacherMapperImpl.toDto(teacher);

        // ASSERT
        assertThat(teacherDtoFromMapper.getId()).isEqualTo(teacher.getId());
        assertThat(teacherDtoFromMapper.getLastName()).isEqualTo(teacher.getLastName());
        assertThat(teacherDtoFromMapper.getFirstName()).isEqualTo(teacher.getFirstName());
        assertThat(teacherDtoFromMapper.getCreatedAt()).isEqualTo(teacher.getCreatedAt());
        assertThat(teacherDtoFromMapper.getUpdatedAt()).isEqualTo(teacher.getUpdatedAt());
    }

    @Test
    public void shouldReturnNull_whenTeacherNullToDto() {
        // ACT
        TeacherDto teacherDtoFromMapper = teacherMapperImpl.toDto((Teacher) null);

        // ASSERT
        assertThat(teacherDtoFromMapper).isNull();
    }

    @Test
    public void shouldReturnTeacher_whenToEntity() {
        // ACT
        Teacher teacherFromMapper = teacherMapperImpl.toEntity(teacherDto);

        // ASSERT
        assertThat(teacherFromMapper.getId()).isEqualTo(teacherDto.getId());
        assertThat(teacherFromMapper.getLastName()).isEqualTo(teacherDto.getLastName());
        assertThat(teacherFromMapper.getFirstName()).isEqualTo(teacherDto.getFirstName());
        assertThat(teacherFromMapper.getCreatedAt()).isEqualTo(teacherDto.getCreatedAt());
        assertThat(teacherFromMapper.getUpdatedAt()).isEqualTo(teacherDto.getUpdatedAt());
    }

    @Test
    public void shouldReturnNull_whenTeacherDtoNullToEntity() {
        // ACT
        Teacher teacherFromMapper = teacherMapperImpl.toEntity((TeacherDto) null);

        // ASSERT
        assertThat(teacherFromMapper).isNull();
    }

    @Test
    public void shouldReturnAListOfTeacherDto_whenListOfTeacherToDto() {
        // ACT
        List<TeacherDto> teacherDtoFromMapper = teacherMapperImpl.toDto(teachers);

        // ASSERT
        assertThat(teacherDtoFromMapper.size()).isGreaterThan(0);
        assertThat(teacherDtoFromMapper).hasSize(teachers.size());
        assertThat(teacherDtoFromMapper.get(0).getLastName()).isEqualTo(teacher.getLastName());
    }

    @Test
    public void shouldReturnAListOfTeacher_whenListOfTeacherDtoToEntity() {
        // ACT
        List<Teacher> teachersFromMapper = teacherMapperImpl.toEntity(teacherDtos);

        // ASSERT
        assertThat(teachersFromMapper.size()).isGreaterThan(0);
        assertThat(teachersFromMapper).hasSize(teacherDtos.size());
        assertThat(teachersFromMapper.get(0).getLastName()).isEqualTo(teacherDto.getLastName());
    }

    @Test
    public void shouldReturnAListNull_whenListOfTeacherNullToDto() {
        // ACT
        List<Teacher> listNull = null;
        List<TeacherDto> teacherDtoFromMapper = teacherMapperImpl.toDto(listNull);

        // ASSERT
        assertThat(teacherDtoFromMapper).isNull();
    }

    @Test
    public void shouldReturnAListNull_whenListOfTeacherDtoNullToEntity() {
        // ACT
        List<TeacherDto> listNull = null;
        List<Teacher> usersFromMapper = teacherMapperImpl.toEntity(listNull);

        // ASSERT
        assertThat(usersFromMapper).isNull();
    }

}
