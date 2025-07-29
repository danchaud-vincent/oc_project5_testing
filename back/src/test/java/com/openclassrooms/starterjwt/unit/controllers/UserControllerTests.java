package com.openclassrooms.starterjwt.unit.controllers;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.openclassrooms.starterjwt.controllers.UserController;
import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.security.WebSecurityConfig;
import com.openclassrooms.starterjwt.security.jwt.AuthEntryPointJwt;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import com.openclassrooms.starterjwt.services.UserService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("unit-test")
@Tag("unit")
@WebMvcTest(controllers = UserController.class)
@Import(WebSecurityConfig.class)
@ContextConfiguration(classes = { UserController.class })
public class UserControllerTests {

    @MockBean
    UserMapper userMapper;

    @MockBean
    UserService userService;

    @MockBean
    UserDetailsServiceImpl userDetailsServiceImpl;

    @MockBean
    JwtUtils jwtUtils;

    @MockBean
    AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    MockMvc mockMvc;

    private User user;
    private UserDto userDto;

    @BeforeEach
    public void init() {
        // ARRANGE
        user = User.builder()
                .id(1L)
                .email("user@email.com")
                .lastName("lastName")
                .firstName("firstName")
                .password("1234")
                .admin(false)
                .build();

        userDto = new UserDto(
                1L,
                "user@email.com",
                "lastName",
                "firstName",
                false,
                "1234",
                null,
                null);
    }

    @Test
    @WithMockUser
    public void UserController_findById_ShouldReturnUserDto() throws Exception {
        // ARRANGE
        when(userService.findById(user.getId())).thenReturn(user);
        when(userMapper.toDto(user)).thenReturn(userDto);

        // ACT
        ResultActions response = mockMvc.perform(get("/api/user/{id}", user.getId().toString()));

        // ASSERT
        response.andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void UserController_findById_ShouldReturnNotFound() throws Exception {
        // ARRANGE
        when(userService.findById(anyLong())).thenReturn(null);

        // ACT
        ResultActions response = mockMvc.perform(get("/api/user/{id}", user.getId().toString()));

        // ASSERT
        response.andExpect(status().isNotFound());
    }

}
