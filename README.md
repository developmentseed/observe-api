# Observe API

## Getting started

To set up a development environment, install the following on your system:

- [git](https://git-scm.com)
- [nvm](https://github.com/creationix/nvm)
- [Docker](https://www.docker.com/)

Clone this repository locally and activate target Node.js version:

```
nvm install
```

Install Node.js dependencies:

```
npm install
```

### Configuration

There are two ways of passing application options for PostgreSQL and OAuth:

1) Using environment variables, full list available at [config/custom-environment-variables.json](config/custom-environment-variables.json)

2) Adding file `config/local-development.json`. It will not be git-tracked and will override options for `development` environment. 

This application uses [config module](https://www.npmjs.com/package/config), please refer to the [documentation](https://github.com/lorenwest/node-config/wiki) for usage details.

### Development

Start development database:

    npm run start-dev-db

Open to a new terminal and migrate the database:

    npm run migrate-dev-db

Start development server with changes monitoring:

    npm run dev

Access the service at [localhost:3000](http://localhost:3000)

When finished, go back to the first terminal session and kill the database container with Ctrl+C.

### Testing

Start test database:

    npm run start-test-db

There is no need to migrate the test database, it will be reset on every test run.

Run tests:

    npm run test

When finished, go back to the first terminal session and kill the database container with Ctrl+C.

## Routes

### GET /

Returns 200 status and "Observe API" text body.

## License

[MIT](LICENSE)
