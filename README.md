# msw-cypress

## Introduction

This library came from a need to be able to mock `msw` handler for particular case or to be able to wait for them to complete.
It sets Cypress interceptors to mock rest & graphql handlers + to wait for them

## How to install

```shell
npm install msw-cypress --save-dev
# or
yarn add --dev msw-cypress
```

This library requires `cypress` and `msw` as peer dependencies

## How to use it

### Creating the msw service worker for Cypress

Default msw service worker won't work with Cypress, so you need to init one with `msw-cypress`.

```shell
npx msw-cypress init <path>
```

### Creating cypress commands

In `cypress/support/index.js`

```ts
import { createCommands } from 'msw-cypress';
import { handlers } from 'path/to/your/handlers';

createCommands({ handlers });
```

### Typescript users

`msw-cypress` provide types for the commands created.

#### In `cypress/tsconfig.json`

You can add `msw-cypress/commands` to your `cypress/tsconfig.json` file (example file from Cypress typescript docs).

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom"],
    "types": ["cypress", "msw-cypress/commands"]
  },
  "include": [
    "**/*.ts",
    "../src/mocks/handlers.ts"
  ]
}
```

Or you can add a reference to the top of each file in which you're using the commands (`/// <reference types="msw-cypress/commands" />`)

```ts
// my-file.spec.ts
/// <reference types="msw-cypress/commands" />

describe('...', () => {
  cy.mswRestIntercept(/* ... */);
  // ...
})
```

## API

### `cy.mswRestIntercept(method, route, mswRestHandler?)`

Register a rest route to be mocked or waited

```ts
cy.mswRestIntercep('GET', 'http://localhost:3000/route')
```

### `cy.mswGraphqlIntercept(operation, operationName, mswGraphqlHandler?)`

Register a graphql operation to be mocked or waited

```ts
cy.mswRestIntercep('mutation', 'MyQueryName')
```

### `cy.mswWait(alias)`

```ts
cy.mswRestIntercep('GET', 'http://localhost:3000/route').as('MockAlias')

cy.wait('@MockAlias')
```