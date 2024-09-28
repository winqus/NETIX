/// <reference types="cypress" />

/* ALL CUSTOM COMMANDS SHOULD BE DECLARED HERE FOR THEM TO BE DEFINABLE AND USABLE IN commands.ts */

declare namespace Cypress {
  interface Chainable {
    createMovieWithPoster(name?: string): Chainable<MovieDTO>;
  }
}
