export type RestMethod =
  | 'HEAD'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS';

export type GraphqlOperationType = 'mutation' | 'query';

export type GraphqlQueryMetadata = {
  operation: string;
  operationName: string;
};
