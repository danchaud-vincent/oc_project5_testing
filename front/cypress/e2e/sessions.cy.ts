import { Session } from '../../src/app/features/sessions/interfaces/session.interface';

import { mockTeachers } from 'cypress/fixtures/teachers.fixtures';
import { mockAdminSessionInfo } from 'cypress/fixtures/adminSessionInformation.fixtures';
import { mockUserSessionInfo } from 'cypress/fixtures/userSessionInformation.fixtures';
import { admin } from 'cypress/fixtures/admin.fixtures';
import { user } from 'cypress/fixtures/user.fixtures';
import { session } from 'cypress/fixtures/session.fixtures';

describe('Sessions spec', () => {
  describe('Sessions as ADMIN', () => {
    const sessionsList: Session[] = [session];

    beforeEach(() => {
      // visit login page
      cy.visit('/login');

      // mock HTTP requests for login
      cy.intercept('POST', '/api/auth/login', {
        body: mockAdminSessionInfo,
      }).as('login');

      cy.intercept('GET', '/api/session', {
        body: sessionsList,
      }).as('getSessions');

      // fill the login form and submit
      cy.get('[data-test="email"]').type(admin.email);
      cy.get('[data-test="password"]').type(admin.password);
      cy.get('[data-test="submit-btn"]').click();

      cy.wait('@login');
      cy.wait('@getSessions');
    });

    it('should display sessions, session information on detail and then go back to /sessions', () => {
      // -------------- ARRANGE --------------
      cy.intercept('GET', '/api/teacher', {
        body: mockTeachers,
      }).as('teachers');

      cy.intercept('GET', `/api/session/${session.id}`, {
        body: session,
      }).as('detailSession');

      const sessionTeacher = mockTeachers.find(
        (teacher) => teacher.id === session.teacher_id
      );

      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, {
        body: sessionTeacher,
      });

      // -------------- ASSERT --------------
      cy.get('[data-test="session"]').should('have.length', 1);

      // -------------- ACT --------------
      // click on edit button
      cy.get('[data-test="detail-btn"]').click();

      cy.wait('@detailSession');

      // -------------- ASSERT --------------
      const regexSessionName = new RegExp(session.name, 'i');
      cy.get('[data-test="sessionName"]')
        .should('exist')
        .invoke('text')
        .then((text) => {
          expect(text).to.match(regexSessionName);
        });
      cy.get('[data-test="sessionTeacher"]').should(
        'contain.text',
        `${sessionTeacher!.firstName} ${sessionTeacher!.lastName.toUpperCase()}`
      );

      cy.get('[data-test="sessionUsers"]').should(
        'contain.text',
        session.users.length
      );
      cy.get('[data-test="sessionDescription"]').should(
        'contain.text',
        session.description
      );
      cy.get('[data-test="sessionCreatedDate"]').should(
        'contain.text',
        session.createdAt!.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
      cy.get('[data-test="sessionUpdatedDate"]').should(
        'contain.text',
        session.updatedAt!.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );

      // -------------- ACT --------------
      // go back
      cy.get('[data-test="back-btn"]').should('exist').click();

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', '/sessions');
    });

    it('should create a session when an admin click on create btn', () => {
      // -------------- ARRANGE --------------
      const newSession: Session = {
        id: 2,
        name: 'new session',
        description: 'it is a new session',
        date: new Date('2025-01-01'),
        teacher_id: 1,
        users: [1, 2],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      cy.intercept('GET', '/api/teacher', {
        body: mockTeachers,
      }).as('teachers');

      cy.intercept('post', '/api/session', {
        body: newSession,
      }).as('createNewSession');

      cy.intercept('GET', '/api/session', {
        body: [...sessionsList, newSession],
      }).as('getNewSessions');

      // -------------- ACT --------------
      // click on create button
      cy.get('[data-test="create-btn"]').click();

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', '/sessions/create');
      cy.get('[data-test="createSession-title"]').should('be.visible');

      // -------------- ACT --------------
      // fill the form and create a new session
      cy.get('[data-test="name"]').type(newSession.name);
      cy.get('[data-test="date"]').type(
        newSession.date.toISOString().split('T')[0]
      );
      cy.get('[data-test="teacherSelect"]').click();
      cy.get('mat-option')
        .contains(`${mockTeachers[0].firstName} ${mockTeachers[0].lastName}`)
        .click();
      cy.get('[data-test="description"]').type(newSession.description);
      cy.get('[data-test="save-btn"]').click();

      cy.wait('@createNewSession');
      cy.wait('@getNewSessions');

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', '/sessions');
      cy.contains('Session created !').should('be.visible');
      cy.get('[data-test="session"]').should('have.length', 2);
      cy.get('[data-test="sessionDescription"]')
        .should('be.visible')
        .should('include.text', newSession.description);
    });

    it('should update a session when an admin click on update btn', () => {
      // -------------- ARRANGE --------------
      const sessionUpdated: Session = {
        id: 1,
        name: 'updated session',
        description: 'it is an updated session',
        date: new Date('2025-01-01'),
        teacher_id: 1,
        users: [1, 2],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      cy.intercept('GET', '/api/teacher', {
        body: mockTeachers,
      }).as('teachers');

      cy.intercept('GET', `/api/session/${session.id}`, {
        body: session,
      }).as('editASession');

      // update the session with the new data
      cy.intercept('PUT', `/api/session/${session.id}`, {
        body: sessionUpdated,
      }).as('updateSession');

      // return the sessions with the one updated
      cy.intercept('GET', '/api/session', {
        body: [sessionUpdated],
      }).as('getFinalSessions');

      // -------------- ACT --------------
      // click on edit button
      cy.get('[data-test="edit-btn"]').click();

      cy.wait('@editASession');

      // -------------- ASSERT -------------
      cy.location('pathname').should('equal', `/sessions/update/${session.id}`);
      cy.get('[data-test="updateSession-title"]').should('be.visible');

      // -------------- ACT --------------
      // fill the form and save the information
      cy.get('[data-test="name"]').clear().type(sessionUpdated.name);
      cy.get('[data-test="date"]')
        .clear()
        .type(sessionUpdated.date.toISOString().split('T')[0]);
      cy.get('[data-test="teacherSelect"]').click();
      cy.get('mat-option')
        .contains(`${mockTeachers[1].firstName} ${mockTeachers[1].lastName}`)
        .click();
      cy.get('[data-test="description"]')
        .clear()
        .type(sessionUpdated.description);
      cy.get('[data-test="save-btn"]').click();

      cy.wait('@updateSession');
      cy.wait('@getFinalSessions');

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', '/sessions');
      cy.contains('Session updated !').should('be.visible');
      cy.get('[data-test="sessionDescription"]')
        .should('be.visible')
        .should('include.text', sessionUpdated.description);
    });

    it('should delete a session when an admin click on delete btn', () => {
      // -------------- ARRANGE --------------
      cy.intercept('GET', '/api/teacher', {
        body: mockTeachers,
      }).as('teachers');

      cy.intercept('GET', `/api/session/${session.id}`, {
        body: session,
      }).as('detailSession');

      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, {
        body: mockTeachers.find((teacher) => teacher.id === session.teacher_id),
      });

      cy.intercept('DELETE', `/api/session/${session.id}`, { body: null });

      cy.intercept('GET', '/api/session', {
        body: [],
      }).as('getFinalSessions');

      // -------------- ACT --------------
      // click on edit button
      cy.get('[data-test="detail-btn"]').click();

      cy.wait('@detailSession');

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', `/sessions/detail/${session.id}`);

      // -------------- ACT --------------
      // click on delete button
      cy.get('[data-test="delete-btn"]').should('be.visible').click();

      cy.wait('@getFinalSessions');

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', '/sessions');
      cy.contains('Session deleted !').should('be.visible');
      cy.get('[data-test="session"]').should('have.length', 0);
    });

    it('an admin cant participate to a session', () => {
      // -------------- ARRANGE --------------
      cy.intercept('GET', '/api/teacher', {
        body: mockTeachers,
      }).as('teachers');

      cy.intercept('GET', `/api/session/${session.id}`, {
        body: session,
      }).as('detailSession');
      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, {
        body: mockTeachers.find((teacher) => teacher.id === session.teacher_id),
      });

      // -------------- ACT --------------
      // click on edit button
      cy.get('[data-test="detail-btn"]').click();

      cy.wait('@detailSession');

      // -------------- ASSERT --------------
      cy.get('[data-test="unparticipate-btn"]').should('not.exist');
      cy.get('[data-test="participate-btn"]').should('not.exist');
    });
  });

  describe('Sessions as USER', () => {
    const sessionParticipate: Session = {
      id: 1,
      name: 'a session',
      description: 'it is a session',
      date: new Date('2025-01-01'),
      teacher_id: 1,
      users: [1, 2],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    const sessionUnParticipate: Session = {
      id: 1,
      name: 'a session',
      description: 'it is a session',
      date: new Date('2025-01-01'),
      teacher_id: 1,
      users: [1],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    beforeEach(() => {
      // visit login page
      cy.visit('/login');

      // mock http requests for login phase
      cy.intercept('POST', '/api/auth/login', {
        body: mockUserSessionInfo,
      }).as('login');

      cy.intercept('GET', '/api/session', {
        body: [session],
      }).as('getSessions');

      // fill the login form and submit
      cy.get('[data-test="email"]').type(user.email);
      cy.get('[data-test="password"]').type(user.password);
      cy.get('[data-test="submit-btn"]').click();

      cy.wait('@login');
      cy.wait('@getSessions');
    });

    it('cant delete a session as a USER', () => {
      // -------------- ARRANGE --------------
      cy.intercept('GET', '/api/teacher', {
        body: mockTeachers,
      }).as('teachers');

      cy.intercept('GET', `/api/session/${session.id}`, {
        body: session,
      }).as('detailSession');

      // -------------- ACT --------------
      // click on detail button
      cy.get('[data-test="detail-btn"]').click();

      // -------------- ASSERT --------------
      cy.get('[data-test="delete-btn"]').should('not.exist');
    });

    it('should participate and unparticipate to a session when an user click on participate btn', () => {
      // -------------- ARRANGE --------------
      cy.intercept('GET', '/api/teacher', {
        body: mockTeachers,
      }).as('teachers');

      cy.intercept('GET', `/api/session/${sessionParticipate.id}`, {
        body: sessionParticipate,
      }).as('detailSession');

      cy.intercept('GET', `/api/teacher/${sessionParticipate.teacher_id}`, {
        body: mockTeachers.find(
          (teacher) => teacher.id === sessionParticipate.teacher_id
        ),
      }).as('teacher');

      // -------------- ACT --------------
      // click on edit button
      cy.get('[data-test="detail-btn"]').click();

      cy.wait('@detailSession');

      // -------------- ASSERT --------------
      // check location
      cy.location('pathname').should(
        'equal',
        `/sessions/detail/${sessionParticipate.id}`
      );

      cy.intercept(
        'DELETE',
        `/api/session/${sessionParticipate.id}/participate/${user.id}`,
        {}
      ).as('unParticipate');

      cy.intercept('GET', `/api/session/${sessionUnParticipate.id}`, {
        body: sessionUnParticipate,
      }).as('unParticipatedSession');

      // -------------- ASSERT then ACT --------------
      // click on do not participate
      cy.get('[data-test="unparticipate-btn"]').should('be.visible').click();

      cy.wait('@unParticipate');
      cy.wait('@unParticipatedSession');

      // -------------- ASSERT --------------
      cy.get('[data-test="unparticipate-btn"]').should('not.exist');

      cy.intercept(
        'POST',
        `/api/session/${sessionParticipate.id}/participate/${user.id}`,
        {}
      ).as('participate');

      cy.intercept('GET', `/api/session/${sessionParticipate.id}`, {
        body: sessionParticipate,
      }).as('ParticipateSesssion');

      // -------------- ASSERT then ACT --------------
      // click on do participate
      cy.get('[data-test="participate-btn"]').should('be.visible').click();

      cy.wait('@participate');
      cy.wait('@ParticipateSesssion');

      // -------------- ASSERT --------------
      cy.get('[data-test="participate-btn"]').should('not.exist');
      cy.get('[data-test="unparticipate-btn"]').should('be.visible');
    });
  });
});
