package com.openclassrooms.starterjwt.integration.controllers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import com.openclassrooms.starterjwt.integration.BaseIntegrationTest;
import com.openclassrooms.starterjwt.mapper.UserMapper;

import com.openclassrooms.starterjwt.services.UserService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class UserControllersTest extends BaseIntegrationTest {

    @Autowired
    UserMapper userMapper;

    @Autowired
    UserService userService;

    @Test
    void contextLoads() {
        System.out.println("URL MySQL: " + mySql.getJdbcUrl());
    }

    @Test
    public void shouldReturn404_whenNoToken() throws Exception {
        // ACT
        ResultActions response = mockMvc.perform(get("/api/user/{id}", "1"));

        // ASSERT
        response.andExpect(status().isUnauthorized());
    }

    @Test
    public void shouldReturn200_whenUserFoundById() throws Exception {
        // ACT
        ResultActions response = mockMvc.perform(get("/api/user/{id}", "1")
                .header("Authorization", "Bearer " + token));

        // ASSERT
        response.andExpect(status().isOk());
    }

}
