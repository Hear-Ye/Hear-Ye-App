/*
 * Copyright (c) Hear Ye LLC and its affiliates
 *
 * This source code is licensed under the Apache 2.0 license found
 * in the LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';
import {Authenticate, getToken, Logout} from './auth';
import url from './url';

/**
 * Base ApiError that extends Error and includes a property response
 */
export class ApiError extends Error {
  constructor(message, response) {
    super(message);
    this.name = 'ApiError';
    this.response = response;
  }
}

/**
 * 400 status code error response
 */
export class BadRequestError extends ApiError {
  constructor(message, response) {
    super(message, response);
  }
}

/**
 * 403 status code error response
 */
export class ForbiddenError extends ApiError {
  constructor(message, response) {
    super(message, response);
  }
}

/**
 * 404 status code error response
 */
export class NotFoundError extends ApiError {
  constructor(message, response) {
    super(message, response);
  }
}

/**
 * 500-599 status code error response
 */
export class ServerError extends ApiError {
  constructor(message, response) {
    super(message, response);
  }
}

/**
 * Constructs a fetch request that handles adding authentication,
 * refreshing of tokens if necessary, additional headers that could
 * be looming, and more specific API errors to be caught.
 *
 * You can use it like (FYI this is a global function, so no import needed):
 *
 * ```javascript
 * try {
 *   const response = await request(...);
 *   const data = await response.json();
 * } catch (e) {
 *   switch (e) {
 *     case SyntaxError:
 *       // could be JSON error
 *       break;
 *     case BadRequestError:  // status code 400
 *     case ForbiddenError:   // status code 403
 *     case ServerError:      // status code 500+
 *       break;
 *     case ApiError:
 *       // Default response error if not 400, 403, or 500+
 *       break;
 *     default:
 *       break;
 *   }
 * }
 * ```
 *
 * If you're in a synchronous function like a component, run:
 *
 * ```javascript
 * request(...).then(response => response.json()).catch(e => {...});
 * ```
 *
 * @param path {String} url path (without the beginning /)
 * @param method {('GET'|'POST')} request method
 * @param options {Object}
 * @param options.authenticated {Boolean} Whether the request uses the saved
 * access token. Default: true
 * @param options.headers {Object} additional headers (can override previous
 * default headers). Default: {}
 * @param options.body {undefined|Object|String} request body, if any
 * @throws {ApiError|BadRequestError|ForbiddenError|ServerError} an error that has a property "response" storing the fetch response. The response has a status code 400 or greater.
 * @return {Promise<Response>} returns a fetch API response if the status code is between 200 to 302, inclusive (i.e. response.ok).
 */
export const request = async (path, method, options = {}) => {
  // Methodology is the exact same as to what's done at
  // https://github.com/Andrew-Chen-Wang/mobile-auth-example
  let headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (
    typeof options.authenticated !== 'boolean' ? true : options.authenticated
  ) {
    headers.Authorization = `Bearer ${await getToken('access')}`;
  }
  headers = {...headers, ...(options.headers ? options.headers : {})};
  // Check if absolute
  const response = await fetch(
    path.indexOf('http://') === 0 || path.indexOf('https://') === 0
      ? path
      : `${url}${path.startsWith('/') ? path.slice(1) : path}`,
    {
      method: method,
      headers: headers,
      body: options.body
        ? typeof options.body === 'object'
          ? JSON.stringify(options.body)
          : options.body
        : options.body,
    },
  );
  if (response.ok) {
    return response;
  }
  if (response.status === 401) {
    if (await Authenticate()) {
      return await request(path, method, options);
    } else {
      await Logout();
    }
  } else {
    switch (response.status) {
      case 400:
        throw new BadRequestError(response.statusText, response);
      case 403:
        throw new ForbiddenError(response.statusText, response);
      case 404:
        throw new NotFoundError(response.statusText, response);
      default:
        if (response.status >= 500) {
          throw new ServerError(response.statusText, response);
        } else {
          throw new ApiError(response.statusText, response);
        }
    }
  }
};
