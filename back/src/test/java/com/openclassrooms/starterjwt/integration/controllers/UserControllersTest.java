package com.openclassrooms.starterjwt.integration.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.openclassrooms.starterjwt.integration.BaseIntegrationTest;
import com.openclassrooms.starterjwt.mapper.UserMapper;

import com.openclassrooms.starterjwt.services.UserService;

// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class UserControllersTest extends BaseIntegrationTest {

    @Autowired
    UserMapper userMapper;

    @Autowired
    UserService userService;

    @Test
    void contextLoads() {
        System.out.println("URL MySQL: " + mySql.getJdbcUrl());
    }

}
