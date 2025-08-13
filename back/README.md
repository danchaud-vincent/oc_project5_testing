# Yoga Application : Backend

## Project Description:

This yoga application serves as a platform for students to connect with yoga teachers. A teacher can create a new session in which students can register to participate in the yoga class.

### Project Goals

The back-end as already been developped earlier. This project aims to **_create unit and integration tests_** in order to safeguard the backend of the application using:

- JUnit
- AssertJ

## Installation

Before running the project, make sur your environment meets the following requirements:

### Prerequisites :

- [Java](https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html) version 11
- [Maven](https://maven.apache.org/)
- [MySQL](https://www.mysql.com/)
- [Node.js](https://nodejs.org/en) version 16
- [Docker](https://www.docker.com/)

### Steps to Setup

**1. Clone the application**

```bash
git clone https://github.com/danchaud-vincent/oc_project5_testing.git
```

**2. Create MySQL Database**

```bash
create database DB_NAME;
```

**3. Setup application.properties**

- Open `back/src/main/resources/application.properties`
- Change the following environment variables by your information:
  - `${DB_NAME}`
  - `${DB_USERNAME}`
  - `${DB_PASSWORD}`
  - `${JwtKey}`

or set the env variables in your console before running mvn :

**using bash:**

```bash
export DB_USERNAME=your_database_username
export DB_PASSWORD=your_database_password
export DB_NAME=your_database_name
export JwtKey=your_jwtKey
```

**using cmd:**

```cmd
set DB_USERNAME=your_database_username
set DB_PASSWORD=your_database_password
set DB_NAME=your_database_name
set JwtKey=your_jwtKey
```

**4. Build and run the app using maven**

- Open the folder `back`:

```bash
cd back
```

- Install dependencies:

```bash
mvn clean install
```

- Launch the backend:

```bash
mvn spring-boot:run
```

## Tests

### Description

**Unit Tests:**

The unit tests are configured to use the following properties file : `back/src/main/resources/application-unit-test.properties`.

This configuration sets up an **_embedded H2 database_**, which is used specifically for testing the repository layer in isolation from the production database.

**Integration Tests:**

The integration tests are configured to use the following properties file : `back/src/main/resources/application-integration-test.properties`.

These tests run against a **_MySQL database running in a Docker container_**.

### Steps to Setup before running tests

**1. Setup the properties files**

- Open `back/src/main/resources/application-integration-test.properties`

- Change the following environment variable by your information:
  - `${JwtKey}`

or set the env variables in your console before running mvn :

**using bash:**

```bash
export DB_USERNAME=your_database_username
export DB_PASSWORD=your_database_password
export DB_NAME=your_database_name
export JwtKey=your_jwtKey
```

**using cmd:**

```cmd
set DB_USERNAME=your_database_username
set DB_PASSWORD=your_database_password
set DB_NAME=your_database_name
set JwtKey=your_jwtKey
```

**2. Docker**

To run the integration tests or all of the tests, you need to **_start docker at first_**.

### Launch tests

**To run all of the tests**

For launch and generate the jacoco code coverage:

**To run only unit tests**

```bash
mvn clean test
```

**To run unit and integration tests**

```bash
mvn clean verify
```

> You can find the jacoco coverage reports in `back/target/site`.

## Ressources

### Postman collection

For Postman import the collection

> ressources/postman/yoga.postman_collection.json

by following the documentation:

https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman

## Technologies used in this project :

- Java version 11
- Node.js version 16
- Maven
- MySQL
- Docker
- JUnit
- Postman

## Author :

**Danchaud Vincent**
