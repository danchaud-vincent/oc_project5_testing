import { SessionInformation } from '../../src/app/interfaces/sessionInformation.interface';
import { User } from '../../src/app/interfaces/user.interface';
import { Session } from '../../src/app/features/sessions/interfaces/session.interface';
import { Teacher } from '../../src/app/interfaces/teacher.interface';

describe('Sessions spec', () => {
  const mockTeachers: Teacher[] = [
    {
      id: 1,
      lastName: 'name',
      firstName: 'teacher1',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: 2,
      lastName: 'name',
      firstName: 'teacher2',
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    },
  ];

  const session: Session = {
    id: 1,
    name: 'a session',
    description: 'it is a session',
    date: new Date('2025-01-01'),
    teacher_id: 1,
    users: [1, 2],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const sessions: Session[] = [session];

  describe('Sessions as ADMIN', () => {
    const mockAdminSessionInfo: SessionInformation = {
      token: 'Bearer',
      type: 'token',
      id: 1,
      username: 'admin@email.com',
      firstName: 'admin',
      lastName: 'admin',
      admin: true,
    };

    const admin: User = {
      id: 1,
      email: 'admin@email.com',
      lastName: 'admin',
      firstName: 'admin',
      admin: true,
      password: 'admin',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    beforeEach(() => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        body: mockAdminSessionInfo,
      }).as('login');

      cy.intercept('GET', '/api/session', {
        body: sessions,
      }).as('getSessions');

      // ACT: fill the login form and submit
      cy.get('[data-test="email"]').type(admin.email);
      cy.get('[data-test="password"]').type(admin.password);
      cy.get('[data-test="submit-btn"]').click();

      cy.wait('@login');
      cy.wait('@getSessions');
    });

    it('should create a session when an admin click on create btn', () => {
      // ARRANGE
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
        body: [...sessions, newSession],
      }).as('getNewSessions');

      // ACT
      cy.get('[data-test="create-btn"]').click();

      // ASSERT
      cy.location('pathname').should('equal', '/sessions/create');
      cy.get('[data-test="createSession-title"]').should('be.visible');

      // ACT :FILL THE FORM OF THE SESSION and SAVE
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

      // ASSERT
      cy.wait('@createNewSession');
      cy.wait('@getNewSessions');
      cy.location('pathname').should('equal', '/sessions');
      cy.contains('Session created !').should('be.visible');
      cy.get('[data-test="session"]').should('have.length', 2);
      cy.get('[data-test="sessionDescription"]')
        .should('be.visible')
        .should('include.text', newSession.description);
    });

    it('should update a session when an admin click on update btn', () => {
      // ARRANGE
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
        body: sessions[0],
      }).as('editASession');
      cy.intercept('PUT', `/api/session/${session.id}`, {
        body: sessionUpdated,
      }).as('updateSession');

      cy.intercept('GET', '/api/session', {
        body: [sessionUpdated],
      }).as('getFinalSessions');

      // ACT
      cy.get('[data-test="edit-btn"]').click();

      // ASSERT
      cy.wait('@editASession');
      cy.location('pathname').should('equal', `/sessions/update/${session.id}`);
      cy.get('[data-test="updateSession-title"]').should('be.visible');

      // ACT :FILL THE FORM OF THE SESSION and SAVE
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

      // ASSERT
      cy.wait('@updateSession');
      cy.wait('@getFinalSessions');
      cy.location('pathname').should('equal', '/sessions');
      cy.contains('Session updated !').should('be.visible');
      cy.get('[data-test="sessionDescription"]')
        .should('be.visible')
        .should('include.text', sessionUpdated.description);
    });

    it('should delete a session when an admin click on delete btn', () => {
      // ARRANGE
      cy.intercept('GET', '/api/teacher', {
        body: mockTeachers,
      }).as('teachers');

      cy.intercept('GET', `/api/session/${session.id}`, {
        body: sessions[0],
      }).as('editASession');
      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, {
        body: mockTeachers.find((teacher) => teacher.id === session.teacher_id),
      });
      cy.intercept('DELETE', `/api/session/${session.id}`, { body: null });

      cy.intercept('GET', '/api/session', {
        body: [],
      }).as('getFinalSessions');

      // ACT
      cy.get('[data-test="detail-btn"]').click();

      // ASSERT
      cy.wait('@editASession');
      cy.location('pathname').should('equal', `/sessions/detail/${session.id}`);

      // ACT :CLICK ON DELETE BTN
      cy.get('[data-test="delete-btn"]').should('be.visible').click();

      // ASSERT
      cy.wait('@getFinalSessions');
      cy.location('pathname').should('equal', '/sessions');
      cy.contains('Session deleted !').should('be.visible');
      cy.get('[data-test="session"]').should('have.length', 0);
    });
  });

  describe('Sessions as USER', () => {
    const mockUserSessionInfo: SessionInformation = {
      token: 'Bearer',
      type: 'token',
      id: 1,
      username: 'user@email.com',
      firstName: 'user',
      lastName: 'user',
      admin: false,
    };

    const user: User = {
      id: 1,
      email: 'user@email.com',
      lastName: 'user',
      firstName: 'user',
      admin: false,
      password: 'user',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

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
      users: [2],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    beforeEach(() => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        body: mockUserSessionInfo,
      }).as('login');

      cy.intercept('GET', '/api/session', {
        body: sessions,
      }).as('getSessions');

      // ACT: fill the login form and submit
      cy.get('[data-test="email"]').type(user.email);
      cy.get('[data-test="password"]').type(user.password);
      cy.get('[data-test="submit-btn"]').click();

      cy.wait('@login');
      cy.wait('@getSessions');
    });

    it.only('cant delete a session', () => {
      // ARRANGE
      cy.intercept('GET', '/api/teacher', {
        body: mockTeachers,
      }).as('teachers');

      cy.intercept('GET', `/api/session/${session.id}`, {
        body: sessions[0],
      }).as('editASession');

      // ACT : go on detail session
      cy.get('[data-test="detail-btn"]').click();

      // ASSERT
      cy.get('[data-test="delete-btn"]').should('not.exist');
    });

    it('should particpate or unparticipate to a session when an user click on participate btn', () => {
      // ARRANGE
      cy.intercept('GET', '/api/teacher', {
        body: mockTeachers,
      }).as('teachers');

      cy.intercept('GET', `/api/session/${session.id}`, {
        body: sessions[0],
      }).as('editASession');

      cy.intercept('GET', `/api/teacher/${session.teacher_id}`, {
        body: mockTeachers.find((teacher) => teacher.id === session.teacher_id),
      });
      cy.intercept(
        'DELETE',
        `/api/session/${sessions[0].id}/participate/${user.id}`,
        {}
      ).as('unParticipate');

      // ACT : go on detail session
      cy.get('[data-test="detail-btn"]').click();

      // ASSERT location
      cy.wait('@editASession');
      cy.location('pathname').should('equal', `/sessions/detail/${session.id}`);

      cy.intercept('GET', `/api/session/${session.id}`, {
        body: sessionUnParticipate,
      }).as('unParticipatedSession');

      // ASSERT btn and ACT: do not participate
      cy.get('[data-test="unparticipate-btn"]').should('be.visible').click();
      cy.wait('@unParticipate');

      // ASSERT
      cy.get('[data-test="unparticipate-btn"]').should('not.exist');

      cy.intercept(
        'POST',
        `/api/session/${sessions[0].id}/participate/${user.id}`,
        {}
      ).as('participate');
      cy.intercept('GET', `/api/session/${session.id}`, {
        body: sessionParticipate,
      }).as('ParticipateSesssion');

      // ASSERT btn and ACT: do participate
      cy.get('[data-test="participate-btn"]').should('be.visible').click();
      cy.wait('@participate');
      cy.get('[data-test="participate-btn"]').should('not.exist');
      cy.get('[data-test="unparticipate-btn"]').should('be.visible');
    });
  });
});
