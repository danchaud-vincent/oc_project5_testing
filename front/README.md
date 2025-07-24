# Yoga Application

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.1.0.

## Project Description :

This yoga application serves as a platform for students to connect with yoga teachers. A teacher can create a new session in which students can register to participate in the yoga class.

### Projet Goals

The front-end as already been developped earlier. This project aims to create unit and integration tests in order to safeguard the application.

<ins>Unit and Integration Tests :</ins>

- Jest

<ins>End-To-End Tests :</ins>

- Cypress

## Installation :

Before running the project, make sur your environment meets the following requirements:

### Prerequisites :

- [**Java**](https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html) version 11
- [**Node.js**](https://nodejs.org/en) version 16
- [**Angular CLI**](https://github.com/angular/angular-cli) version 14.1.0
- [**MySQL**](https://www.mysql.com/) (for the backend database)

### Setps to Setup

**0. Before running the frontend**

To use the app, make sure that the backend server is started before starting the frontend.
Otherwise, the tests are available and can be execute without the backend running. [See this section](#tests)

**1. Clone the application**

```bash
git clone https://github.com/danchaud-vincent/oc_project5_testing.git
```

**2. Go inside the front folder**

```bash
cd front
```

**3. Install dependencies**

```bash
npm install
```

**4. Launch Front-end**

```bash
npm run start
```

or

```bash
npx ng serve --open
```

## Tests

### Unit and Integration test

**Technologie**: [Jest](https://jestjs.io/docs/getting-started)

Launching test:

```bash
npm run test
```

For the coverage:

```bash
npx jest --coverage
```

Coverage report in the browser. Go to /coverage:

```bash
coverage/index.html
```

for following change:

```bash
npm run test:watch
```

### E2E

**Technologie**: [Cypress](https://docs.cypress.io/app/get-started/why-cypress)

Launching e2e test:

```bash
npm run e2e
```

Generate coverage report (you should launch e2e test before):

```bash
npm run e2e:coverage
```

Report is available here:

```bash
front/coverage/lcov-report/index.html
```

## Ressources

### Postman collection

For Postman import the collection

> ressources/postman/yoga.postman_collection.json

by following the documentation:

https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman

### MySQL

SQL script for creating the schema is available `ressources/sql/script.sql`

By default the admin account is:

- login: yoga@studio.com
- password: test!1234

## Technologies used in this project :

- Angular version 14.1.0
- Jest
- Cypress
- Postman
- MySQL

## Author :

**Danchaud Vincent**
