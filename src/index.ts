import {
  graphql,
  MockedRequest,
  RequestHandler,
  rest,
  setupWorker,
  SetupWorkerApi,
} from 'msw';
import 'cypress-wait-until';
import { GraphqlOperationType, RestMethod } from './types';
import { makeUniqueKey, requestKey } from './utils';

type LowercasedRestMethod =
  | 'head'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options';

type RequestCall = {
  id: MockedRequest['id'];
  request: MockedRequest;
  complete: boolean;
};

type Request = {
  complete: boolean;
  calls: RequestCall[];
};

type CreateCommandsOptions = {
  serviceWorkerPath?: string;
  handlers: RequestHandler[];
};

export function createCommands({
  serviceWorkerPath = '/cypressMockServiceWorker.js',
  handlers,
}: CreateCommandsOptions): void {
  let requests: Record<string, Request> = {};
  let worker: SetupWorkerApi;
  let routes = new Set<string>();

  const registerRequest = (request: MockedRequest): void => {
    const key = requestKey(routes, request) ?? makeUniqueKey(request);
    if (!requests[key]) {
      requests[key] = { complete: false, calls: [] };
    }

    requests[key].complete = false;
    requests[key].calls.push({ id: request.id, request, complete: false });
  };

  const completeRequest = (request: MockedRequest) => {
    const key = requestKey(routes, request);

    if (!key || !requests[key]) {
      return;
    }

    requests[key].complete = true;
    const call = requests[key].calls.find((r) => r.id === request.id);
    if (!call) {
      return;
    }

    call.complete = true;
  };

  before(() => {
    worker = setupWorker(...handlers);

    worker.on('request:start', (request) => {
      registerRequest(request);
    });
    worker.on('request:end', (request) => {
      completeRequest(request);
    });

    cy.wrap(
      worker.start({
        serviceWorker: {
          url: serviceWorkerPath,
        },
      }),
      { log: false }
    );
  });

  Cypress.on('test:before:run', () => {
    if (!worker) {
      return;
    }

    worker.resetHandlers();
    requests = {};
    routes = new Set();
  });

  Cypress.Commands.add(
    'mswRestIntercept',
    function restIntercept(type: RestMethod, route: string, fn) {
      const key = `${type}:${route}`;

      if (fn) {
        const restMethod = type.toLowerCase() as LowercasedRestMethod;
        worker.use(rest[restMethod](route, fn));
      }

      routes.add(key);
      return cy.wrap(key, { log: false });
    }
  );

  Cypress.Commands.add(
    'mswGraphqlIntercept',
    function graphqlIntercept(
      operation: GraphqlOperationType,
      operationName: string,
      fn
    ) {
      const key = `${operation}:${operationName}`;

      if (fn) {
        worker.use(graphql[operation](operationName, fn));
      }

      routes.add(key);
      return cy.wrap(key, { log: false });
    }
  );

  Cypress.Commands.add('mswWait', (alias: string) => {
    cy.get<string>(alias, { log: false }).then((key) => {
      Cypress.log({
        displayName: 'mswWait',
        message: `${alias} — ${key.replace(':', ' ')}`,
      });

      cy.waitUntil(() => requests[key] && requests[key].complete, {
        log: false,
      }).then(() => {
        const calls = requests[key].calls;
        cy.wrap(calls[calls.length - 1], { log: false });
      });
    });
  });
}
