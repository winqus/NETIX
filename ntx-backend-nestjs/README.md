## Description

Netix backend with NestJS.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

By default all http requests are mocked (see `setupJest.ts`).
To prevent mocking, add the following to your test files:
```ts
beforeEach(() => { // if you have an existing `beforeEach` just add the following line to it
  fetchMock.dontMock() // changes default behavior of fetchMock to use the real 'fetch' implementation and not mock responses
  
  fetchMock.doMock() // if a test requires mocking, you can use this to enable mocking for that test (could be in a `beforeEach` or `it` block, etc.)
})
```

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
