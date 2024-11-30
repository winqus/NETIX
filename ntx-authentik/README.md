# Authentik
## Description
OAuth2 provider Authentik is used for Netix authentication.

## Setup
* Have [Docker](https://www.docker.com/products/docker-desktop/) and run it.
* Run `docker-compose up -d` (setups and runs authentik needed containers).
* In the **ntx-authentik** repository folder create **.env** file (check below).
* To start the initial Authentik setup, navigate to `http://localhost:9000/if/flow/initial-setup/` (replace `localhost` with an IP if using a dedicated server). There you are prompted to set a password for the `akadmin` user (the default user).
* Later, you can access the Authentik admin panel at `http://localhost/if/admin/` (replace `localhost` with an IP if using a dedicated server).

## Development .env file
Create a **.env** file in the **ntx-authentik** repository folder with the following content:

```bash
PG_PASS=ddddddddddddddddddddddddddddddddd
AUTHENTIK_SECRET_KEY=eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
AUTHENTIK_ERROR_REPORTING__ENABLED=true
COMPOSE_PORT_HTTP=80
COMPOSE_PORT_HTTPS=443
```

## Stopping / Removing
* Docker containers can be stopped with terminal command in the **ntx-authentik** folder: `docker-compose stop` or `docker-compose down` (to remove stopped container and docker network). Alternatively, the container group can be stopped in the Docker Desktop client.
