## Description
Netix backend with NestJS.

# NETIX
Streaming platform designed for tailored home entertainment within a home network, developed for educational purposes.

## Setup
* Have node.js installed (v20.x.x, check with `node -v` in cmd).
* Have NestJS client installed (`npm i -g @nestjs/cli`).
* Have [Docker](https://www.docker.com/products/docker-desktop/) and run it.
* VSCode is the preferred IDE.
* Run `npm run docker-compose:up` (setups and runs mongodb and redis image containers; make sure Docker Desktop/Engine is running).
* In the **ntx-backend-nestjs** repository folder, run command in the terminal: `npm install` (installs needed dependencies), create **.env** file (check below), finally run `npm run start` (successful when you see in terminal the host address).
* Container data (db, etc.) and upload data is stored in the *./data* folder in **ntx-backend-nestjs* root dir. Make sure it's created, also create folders *./data/uploads*, *./data/redis*, *./data/mongodb*. Unlikely, but could potentially fail to create sub-folders inside, check it (and possibly the logs) when uploading something (e.g. video file, thumbnail).

## Removal
* Docker containers can be stopped with terminal command in the **ntx-backend-nestjs** folder: `npm run docker-compose:stop` or `npm run docker-compose:down` (to remove stopped container and docker network). Alternatively, the container group can be stopped in the Docker Desktop client.

## Development .env file
Create a **.env** file in the **netix-backend-node** repository folder with the following content:
```bash
### APP ###
NODE_ENV='development'
PORT=3055
### DB ###
MONGODB_URI='mongodb://user_m1:pass_m1@127.0.0.1:27018?authMechanism=DEFAULT'
REDIS_HOST='127.0.0.1'
REDIS_PORT=6379
REDIS_PASSWORD='pass_r1'
### CLIENT ###
CLIENT_ORIGIN_URL='http://localhost:4200'
### 3rd party API ###
TMDB_API_KEY=<your TMDB API KEY (READ ACCESS) (https://developer.themoviedb.org/reference/intro/getting-started)>
### TEST ###
USE_MEMORY_MONGO=true # set to true for a temporary in-memory database (will log to console the connection string)
IN_MEMORY_MONGO_PORT=57017 # if commented, port will be random
USE_MEMORY_REDIS=true # set to true for a temporary in-memory database (will log to console the connection string)
USE_TEMPORARY_FILE_STORAGE=true # set to true to use a temp file storage (its destroyed on server shutdown with Ctrl+C)
### AUTH ###
USE_FAKE_AUTH=true
OAUTH2_ISSUER_URL='http://localhost/application/o/netix/' # check if Authentik app's name is 'netix'
OAUTH2_JWKS_URL='http://localhost/application/o/netix/jwks/' # check if Authentik app's name is 'netix'
OAUTH2_CLIEND_ID='xXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx' # your Authentik app's provider's Client ID
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
