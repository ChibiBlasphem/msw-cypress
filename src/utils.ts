import { parse } from 'graphql';
import {
  DefaultRequestBody,
  GraphQLRequestBody,
  MockedRequest as MswMockedRequest,
} from 'msw';
import { match } from 'node-match-path';
import { GraphqlQueryMetadata } from './types';

type MockedRequest<T = DefaultRequestBody> = Pick<
  MswMockedRequest<T>,
  'id' | 'method' | 'body' | 'url'
>;

export const isGraphqlRequest = (
  request: MockedRequest
): request is MockedRequest<GraphQLRequestBody<Record<string, any>>> => {
  const { body } = request;
  if (!body || typeof body === 'string') {
    return false;
  }

  return request.method === 'POST' && 'variables' in body && 'query' in body;
};

export const getGraphqlQueryInfo = (
  request: MockedRequest<GraphQLRequestBody<Record<string, any>>>
): GraphqlQueryMetadata | null => {
  const queryMetadata = parse(request.body?.query);
  const queryDefinition = queryMetadata.definitions[0];

  if (
    !queryDefinition ||
    queryDefinition.kind !== 'OperationDefinition' ||
    !queryDefinition.name
  ) {
    return null;
  }

  const {
    operation,
    name: { value: operationName },
  } = queryDefinition;

  return { operation, operationName };
};

export const requestKey = (
  routes: Set<string>,
  request: MockedRequest
): string | undefined => {
  return Array.from(routes).find((r) => {
    const [type, routeOrOperation] = r.split(/:(.+)/);

    if (isGraphqlRequest(request)) {
      const metadata = getGraphqlQueryInfo(request);
      if (!metadata) {
        return false;
      }

      const { operation, operationName } = metadata;
      return operation === type && operationName === routeOrOperation;
    }

    const routeMatched = match(routeOrOperation, request.url.toString());
    return request.method === type && routeMatched.matches;
  });
};

export const makeUniqueKey = (request: MockedRequest): string => {
  if (isGraphqlRequest(request)) {
    const metadata = getGraphqlQueryInfo(request);
    if (metadata) {
      return `${metadata.operation}:${metadata.operationName}`;
    }
  }
  return `${request.method}:${request.url.toString()}`;
};
