# NETIX
Streaming platform designed for tailored home entertainment within a home network, developed for educational purposes.

## Setup
* Have node.js installed (v20.x.x, check with `node -v` in cmd), angular client (v17.x.x, check with `ng version`).
* Install [Docker](https://www.docker.com/products/docker-desktop/).
* VSCode is the preferred IDE.
* Run `docker-compose-up` (setups and runs mongodb and redis image containers).
* In the **netix-backend-node** repository folder, run command in the terminal: `npm install` (installs needed dependencies), finally `npm run start`.
* In the **frontend-web-angular** repository folder, run command in the terminal: `npm install` (installs needed dependencies), finally `npm run start`.
* Container data (db, etc.) and upload data is stored in the *./data* folder in **netix-backend-node**. Make sure it's created, also create *./data/uploads* folder.

## Removal
* Docker containers can be stopped with terminal command in the **netix-backend-node** folder: `npm run docker-compose-stop` or `npm run docker-compose-down` (to remove stopped container and docker network).
