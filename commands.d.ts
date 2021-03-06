/// <reference types="Cypress" />

declare namespace Cypress {
  type MockedResponse = import('msw').MockedResponse;

  type MSWRestHandlerFunction = (
    req: import('msw').RestRequest,
    res: import('msw').ResponseComposition,
    ctx: import('msw').RestContext
  ) => MockedResponse | Promise<MockedResponse>;

  type MSWGraphqlHandlerFunction<DataType, Variables> = (
    req: import('msw').GraphQLRequest<Variables>,
    res: import('msw').ResponseComposition,
    ctx: import('msw').GraphQLContext<DataType>
  ) => MockedResponse | Promise<MockedResponse>;

  interface Chainable {
    mswRestIntercept: (
      type: import('./dist/types').RestMethod,
      route: string,
      fn?: MSWRestHandlerFunction
    ) => Chainable<string>;

    mswGraphqlIntercept: <
      DataType = Record<string, any>,
      Variables = Record<string, any>
    >(
      operation: import('./dist/types').GraphqlOperationType,
      operationName: string,
      fn?: MSWGraphqlHandlerFunction<DataType, Variables>
    ) => Chainable<string>;

    mswWait: (alias: string) => Chainable<void>;
  }
}
