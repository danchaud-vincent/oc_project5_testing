package com.openclassrooms.starterjwt.integration;

import java.time.Duration;

import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;

public class MySQLTestContainer extends MySQLContainer<MySQLTestContainer> {

    private static final String IMAGE_VERSION = "mysql:8.0.33";
    private static MySQLTestContainer container;

    private MySQLTestContainer() {
        super(IMAGE_VERSION);
        this.withDatabaseName("testdb")
                .withUsername("testUser")
                .withPassword("testPassword")
                .waitingFor(
                        Wait.forLogMessage(".*ready for connections.*\n", 1)
                                .withStartupTimeout(Duration.ofSeconds(30)));
    }

    public static synchronized MySQLTestContainer getInstance() {
        if (container == null) {
            container = new MySQLTestContainer();
            container.start();
        }

        return container;
    }

}
