# NETIX
Streaming platform designed for tailored home entertainment within a home network, developed for educational purposes.

## Setup
* Have node.js installed (v20.x.x, check with `node -v` in cmd), angular client (v17.x.x, check with `ng version`).
* Install [Docker](https://www.docker.com/products/docker-desktop/) and run it.
* VSCode is the preferred IDE.
* Run `npm run docker-compose-up` (setups and runs mongodb and redis image containers; make sure Docker Desktop/Engine is running).
* In the **netix-backend-node** repository folder, run command in the terminal: `npm install` (installs needed dependencies), create **.env** file (check below), finally run `npm run start` (successful when you see in terminal `Server is running at http://.......`).
* In the **frontend-web-angular** repository folder, run command in the terminal: `npm install` (installs needed dependencies), create **.env** file (check below), for the first time (or when .env file is changed) run `npm run start-with-env`, other times use `npm run start`.
 The env command will set the environment variables for the Angular app in the **src/environments/** files. **DO NOT COMMIT THE ENVIROMENT/ FILES WITH SENSITIVE DATA**.
* Container data (db, etc.) and upload data is stored in the *./data* folder in **netix-backend-node** root dir. Make sure it's created, also create folders *./data/uploads*, *./data/redis*, *./data/mongodb*. Unlikely, but could potentially fail to create sub-folders inside, check it (and possibly the logs) when uploading something (e.g. video file, thumbnail).

## Removal
* Docker containers can be stopped with terminal command in the **netix-backend-node** folder: `npm run docker-compose-stop` or `npm run docker-compose-down` (to remove stopped container and docker network). Alternatively, the container group can be stopped in the Docker Desktop client.

## Development .env file
Create a **.env** file in the **netix-backend-node** repository folder with the following content:
```bash
PORT=3055
MONGODB_URI='mongodb://user_m1:pass_m1@127.0.0.1:27018?authMechanism=DEFAULT'
REDIS_HOST='127.0.0.1'
REDIS_PORT=6379
REDIS_PASSWORD='pass_r1'
CLIENT_ORIGIN_URL='http://localhost:4200'
# AUTH0_AUDIENCE=<none for now>
# AUTH0_DOMAIN=<none for now>
```

Create a **.env** file in the **frontend-web-angular** repository folder with the following content:
```bash
# AUTH0_DOMAIN=<none for now>
# AUTH0_CLIENT_ID=<none for now>
# AUTH0_AUDIENCE=<none for now>
# AUTH0_CALLBACK_URL=http://localhost:4200
API_SERVER_URL=http://localhost:3055
```

## Logging
* **netix-backend-node** logging is done with Winston, logs are stored in the *./logs* folder.
* **frontend-web-angular** Logging is done with Angular's built-in logging service or default console.log, logs are stored in the browser's console.

## Authentication (for now disabled)
* Authentication is done with Auth0
* Temporary disabled for development purposes, **netix-backend-node** has the authentication middleware commented out or fake user token is used.
