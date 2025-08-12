package com.openclassrooms.starterjwt.unit.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
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

import com.openclassrooms.starterjwt.controllers.TeacherController;
import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.TeacherService;

@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class TeacherControllerTests {

    @Mock
    TeacherMapper teacherMapper;

    @Mock
    TeacherService teacherService;

    @InjectMocks
    private TeacherController teacherController;

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
    public void findById_shouldReturnTeacherDto_whenTeacherExists() {
        // ARRANGE
        when(teacherService.findById(teacher.getId())).thenReturn(teacher);
        when(teacherMapper.toDto(teacher)).thenReturn(teacherDto);

        // ACT
        ResponseEntity<?> response = teacherController.findById(teacher.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(teacherDto);
        verify(teacherService).findById(teacher.getId());
        verify(teacherMapper).toDto(teacher);
    }

    @Test
    public void findById_shouldReturnNotFound_whenTeacherNotExists() {
        // ARRANGE
        when(teacherService.findById(teacher.getId())).thenReturn(null);

        // ACT
        ResponseEntity<?> response = teacherController.findById(teacher.getId().toString());

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
        verify(teacherMapper, times(0)).toDto(teacher);
    }

    @Test
    public void findById_shouldReturnBadRequest_whenRequestWithBadNumberFormat() {
        // ACT
        ResponseEntity<?> response = teacherController.findById("abc");

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(teacherMapper, times(0)).toDto(any(Teacher.class));
    }

    @Test
    public void findAll_shouldReturnListOfTeacherDtos_whenListTeachersExist() {
        // ARRANGE
        when(teacherService.findAll()).thenReturn(teachers);
        when(teacherMapper.toDto(teachers)).thenReturn(teacherDtos);

        // ACT
        ResponseEntity<?> response = teacherController.findAll();

        // ASSERT
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(teacherDtos);
        verify(teacherService).findAll();
        verify(teacherMapper).toDto(teachers);
    }

}
