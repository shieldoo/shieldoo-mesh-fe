import type { BaseQueryApi } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import type { GraphQLClient, RequestOptions } from 'graphql-request'

export type Document = RequestOptions['document'];
export type Variables = RequestOptions['variables'];
export type RequestHeaders = RequestOptions['requestHeaders'];

export type GraphqlRequestBaseQueryArgs = {
  options:
    | {
        url: string
        requestHeaders?: RequestHeaders
      }
    | { client: GraphQLClient }
  prepareHeaders?: (
    headers: Headers,
    api: Pick<BaseQueryApi, 'getState' | 'endpoint' | 'type' | 'forced'>
  ) => MaybePromise<Headers>
};

export type QueryReturnValue<T = unknown, E = unknown, M = unknown> =
  | {
      error: E
      data?: undefined
      meta?: M
    }
  | {
      error?: undefined
      data: T
      meta?: M
    };

export type MaybePromise<T> = T | PromiseLike<T>;

export type RequestError = {
  statusCode: number,
  stack: string | undefined,
  errors: { message: string }[]
};

