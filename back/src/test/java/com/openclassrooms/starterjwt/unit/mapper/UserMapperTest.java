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

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.UserMapperImpl;
import com.openclassrooms.starterjwt.models.User;

@ActiveProfiles("unit-test")
@Tag("unit")
@ExtendWith(MockitoExtension.class)
public class UserMapperTest {

    @InjectMocks
    private UserMapperImpl userMapperImpl;

    private User user;
    private UserDto userDto;
    private List<User> users;
    private List<UserDto> userDtos;

    @BeforeEach
    public void init() {
        LocalDateTime createdAt = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2025, 2, 2, 0, 0, 0);

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

        userDto = new UserDto(
                1L,
                "user@email.com",
                "lastName",
                "firstName",
                false,
                "1234",
                createdAt,
                updatedAt);

        users = List.of(user);
        userDtos = List.of(userDto);
    }

    @Test
    public void shouldReturnUserDto_whenToDto() {
        // ACT
        UserDto userDtoFromMapper = userMapperImpl.toDto(user);

        // ASSERT
        assertThat(userDtoFromMapper.getEmail()).isEqualTo(user.getEmail());
        assertThat(userDtoFromMapper.getLastName()).isEqualTo(user.getLastName());
        assertThat(userDtoFromMapper.getFirstName()).isEqualTo(user.getFirstName());
        assertThat(userDtoFromMapper.getPassword()).isEqualTo(user.getPassword());
        assertThat(userDtoFromMapper.isAdmin()).isEqualTo(user.isAdmin());
        assertThat(userDtoFromMapper.getCreatedAt()).isEqualTo(user.getCreatedAt());
        assertThat(userDtoFromMapper.getUpdatedAt()).isEqualTo(user.getUpdatedAt());
    }

    @Test
    public void shouldReturnNull_whenUserNullToDto() {
        // ACT
        UserDto userDtoFromMapper = userMapperImpl.toDto((User) null);

        // ASSERT
        assertThat(userDtoFromMapper).isNull();
    }

    @Test
    public void shouldReturnUser_whenToEntity() {
        // ACT
        User userFromMapper = userMapperImpl.toEntity(userDto);

        // ASSERT
        assertThat(userFromMapper.getEmail()).isEqualTo(userDto.getEmail());
        assertThat(userFromMapper.getLastName()).isEqualTo(userDto.getLastName());
        assertThat(userFromMapper.getFirstName()).isEqualTo(userDto.getFirstName());
        assertThat(userFromMapper.getPassword()).isEqualTo(userDto.getPassword());
        assertThat(userFromMapper.isAdmin()).isEqualTo(userDto.isAdmin());
        assertThat(userFromMapper.getCreatedAt()).isEqualTo(userDto.getCreatedAt());
        assertThat(userFromMapper.getUpdatedAt()).isEqualTo(userDto.getUpdatedAt());
    }

    @Test
    public void shouldReturnNull_whenUserNullToEntity() {
        // ACT
        User userFromMapper = userMapperImpl.toEntity((UserDto) null);

        // ASSERT
        assertThat(userFromMapper).isNull();
    }

    @Test
    public void shouldReturnAListOfUserDto_whenToDtoOfList() {
        // ACT
        List<UserDto> userDtosFromMapper = userMapperImpl.toDto(users);

        // ASSERT
        assertThat(userDtosFromMapper.size()).isGreaterThan(0);
        assertThat(userDtosFromMapper).hasSize(users.size());
        assertThat(userDtosFromMapper.get(0).getEmail()).isEqualTo(user.getEmail());
    }

    @Test
    public void shouldReturnAListOfUser_whenToEntityOfList() {
        // ACT
        List<User> usersFromMapper = userMapperImpl.toEntity(userDtos);

        // ASSERT
        assertThat(usersFromMapper.size()).isGreaterThan(0);
        assertThat(usersFromMapper).hasSize(userDtos.size());
        assertThat(usersFromMapper.get(0).getEmail()).isEqualTo(userDto.getEmail());
    }

    @Test
    public void shouldReturnAListNull_whenListNullToDto() {
        // ACT
        List<User> listNull = null;
        List<UserDto> userDtosFromMapper = userMapperImpl.toDto(listNull);

        // ASSERT
        assertThat(userDtosFromMapper).isNull();
    }

    @Test
    public void shouldReturnAListNull_whenListNullToEntity() {
        // ACT
        List<UserDto> listNull = null;
        List<User> usersFromMapper = userMapperImpl.toEntity(listNull);

        // ASSERT
        assertThat(usersFromMapper).isNull();
    }

}
