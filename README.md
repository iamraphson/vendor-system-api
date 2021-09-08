# Vendor Machine API
## Description

Design an API for a vending machine, allowing users with a “seller” role to add, update or remove products, while users with a “buyer” role can deposit coins into the machine and make purchases. Your vending machine should only accept 5, 10, 20, 50 and 100 cent coins

## Installation

```bash
$ git clone https://github.com/iamraphson/vendor-system-api.git
$ cd vendor-system-api
$ cp .env.exmaple .env #don't forget to update the DB credential
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Test

```bash
# e2e tests
$ npm run test:e2e
```

##Documentation
Navigate to  ```http://localhost:3000/docs``` on your computer to view the openapi documentation.

## Technology Stack
* **Language**: [Javascript](https://www.typescriptlang.org/)
* **Web Framework**: [NestJS](https://docs.nestjs.com)
* **Database**: [Mysql](https://www.mysql.com/)

## Todo
- [x] Increase test coverage.

## License

Vendor Machine API  is MIT licensed.
