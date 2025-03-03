# ntx-web-fe-angular

## Setup

In the **ntx-web-fe-angular** repository folder, run commands in the terminal or use pre-build npm scripts in VS code:

- `npm install` (installs needed dependencies)
- create **.env** file (check below)
- for the first time (or when .env file is changed) run `npm run start-with-env`, other times use `npm run start`.

The env command will set the environment variables for the Angular app in the **src/environments/** files. **DO NOT COMMIT THE ENVIROMENT/ FILES WITH SENSITIVE DATA**.

## Development .env file

Create a **.env** file in the **ntx-web-fe-angular** repository folder with the following content:

```bash
### APP ###
PRODUCTION_ENVIRONMENT=false
### API ###
API_SERVER_URL=http://localhost:3055
### AUTH ###
USE_FAKE_AUTH=true
OAUTH2_SERVER_URL=http://localhost:80
OAUTH2_CLIENT_ID=xXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx
OAUTH2_ISSUER_URI=http://localhost/application/o/netix/
OAUTH2_REDIRECT_URI=http://localhost:4200/auth/callback
```

## Logging

- **ntx-web-fe-angular** Logging is done with Angular's built-in logging service or default console.log, logs are stored in the browser's console.

## Authentication (for now disabled)

# Generated by Angular CLI:

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.1.4.

## Development server

Run `ng serve` for a dev server. Navigate to [`http://localhost:4200/`](http://localhost:4200/). The application will automatically reload if you change any of the source files.

## Code scaffolding

### File structure

```bash
├───app
│   ├───core
│   │   ├───layouts
│   │   │   ├───empty-layout
│   │   │   └───main-layout
│   │   ├───pipes
│   │   └───providers
│   ├───pages
│   │   ├───create-title
│   │   │   └───upload-title
│   │   │       └───components
│   │   │           ├───file-upload
│   │   │           ├───image-cropper
│   │   │           └───image-upload
│   │   ├───error-page
│   │   ├───movie-card
│   │   ├───movie-card-skeleton
│   │   ├───movie-list
│   │   ├───navbar
│   │   └───video-viewer
│   └───shared
│       ├───config
│       ├───mappers
│       ├───models
│       ├───services
│       │   ├───upload
│       │   └───utils
│       └───ui
│           ├───alert-card
│           └───svg-icons
└───environments
```

1. `/core` (services to be used from the root)
2. `/pages` (the functional branches of the navigation tree)
3. `/shared` (utilities to be used from functional branches)

Run `ng generate component component-name` to generate a new component, with specific target name. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

Run `cypress open` to run e2e tests via Cypress.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
