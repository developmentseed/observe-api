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

2) Adding configuration file `config/local-development.json`. It will not be git-tracked and will override options for `development` environment. Please refer to this [example](config/local-development.json.example).

This application uses [config module](https://www.npmjs.com/package/config), please check the [documentation](https://github.com/lorenwest/node-config/wiki) for usage details.

### Development

Start development database:

    npm run start-dev-db

Open a new terminal and migrate the database:

    npm run migrate-dev-db

If your with to populate it with mock data, run:

    npm run populate-dev-db

Please consider that the last step will **wipe any previous data** from the development database.

Start development server with changes monitoring:

    npm run dev

Access the service at [localhost:3000](http://localhost:3000)


When finished, go back to the first terminal session and kill the database container with Ctrl+C.

### Testing

Start test database:

    npm run start-test-db

There is no need to migrate the test database, it will be reset on every test run.

Open a new terminal and run tests:

    npm run test

When finished, go back to the first terminal session and kill the database container with Ctrl+C.

## API Documentation

Start documentation server:

    npm run view-docs

Visit http://localhost:8080.    

## License

[MIT](LICENSE)
