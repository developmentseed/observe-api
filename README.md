# Observe API

Data service for [Observe](https://github.com/developmentseed/observe) platform. This is a web server built in Node.js that provides an application programming interface for the [dashboard](https://github.com/developmentseed/observe-dashboard) and [mobile app](https://github.com/developmentseed/observe) of Observe.

Documentation is available at:

- [API](http://developmentseed.github.io/observe-api)
- [Platform](https://github.com/developmentseed/observe#documentation) 

This software is in early stages of development. Please visit the [issues page](https://github.com/developmentseed/observe-api/issues) to learn about known bugs and feature development.

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

Add mock users, traces and photos for testing:

    npm run seed-dev

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

### Cleaning media folder

A script is available to list files in the media folder that do not correspond to a existing photo at the database. The example command below will connect to the test database and generate a list of "orphaned" media files to `orphaned.txt`, which can be used to remove files via shell script:

    NODE_ENV=test node -r esm scripts/list-orphaned-files > orphaned.txt

Change or remove `NODE_ENV` value to apply to a different environment.

## API Documentation

Start documentation server:

    npm run view-docs

Visit http://localhost:8080.

## License

[MIT](LICENSE)
