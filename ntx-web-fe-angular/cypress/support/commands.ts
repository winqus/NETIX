/// <reference types="cypress" />

import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import convertRouteToPath from './convertRoute';
import { getMovieUrl } from '@ntx/app/shared/config/api-endpoints';
import { makeRandomMovieName, makeRandomMovieSummary, makeRandomMovieReleaseDate, makeRandomMovieRuntime } from './randomDataFactory';

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

/* ALL COMMANDS DEFINED HERE SHOULD BE DECLARED IN cypress/support/cypress.d.ts */

Cypress.Commands.add('createMovieWithPoster', (args: any): Cypress.Chainable<MovieDTO> => {
  const { name, summary, releaseDate, runtime } = args || {};

  const CREATE_MOVIE_REQUEST_TOKEN = 'create-movie-request';
  cy.intercept('POST', convertRouteToPath(getMovieUrl())).as(CREATE_MOVIE_REQUEST_TOKEN);

  cy.visit('/createTitle');
  cy.get('[aria-label="Create"]').click();

  cy.get('#title').type(name || makeRandomMovieName(), { delay: 0 });
  cy.get('#summary').type(summary || makeRandomMovieSummary(), { delay: 0 });
  cy.get('#originallyReleasedAt').type(releaseDate || makeRandomMovieReleaseDate(), { delay: 0 });
  cy.get('#runtimeMinutes').type(runtime || makeRandomMovieRuntime().toString(), { delay: 0 });

  cy.get('.mr-6 > > .relative > .w-full').selectFile('cypress/files/1_sm_284x190.webp');

  cy.get('.btn').contains('CREATE').click();
  return cy.wait('@' + CREATE_MOVIE_REQUEST_TOKEN).then((interception) => {
    const response = interception.response!;
    expect(response.statusCode).to.equal(201);
    return response.body as MovieDTO;
  });
});
