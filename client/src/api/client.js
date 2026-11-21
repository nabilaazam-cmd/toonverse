// The one function every frontend API module uses to call the Toonverse API.
// See docs/api.md: every route starts with /api, data is JSON, the login cookie
// (tv_token) is sent by the browser, and every error looks like
// { "error": { "code", "message", "details" } }.

// Empty in development, so requests go to /api/... and the Vite proxy forwards them.
// Set when building for staging or production. A trailing "/" is removed so addresses
// never get a double slash.
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

const NETWORK_MESSAGE = 'Could not reach the server. Check your connection and try again.';
const UNEXPECTED_MESSAGE = 'Something went wrong. Please try again.';

// The error request() throws when a call fails.
// status:  the HTTP status, or 0 when the server could not be reached.
// code:    a fixed text the screens can check, such as "UNAUTHENTICATED".
//          NETWORK_ERROR and UNEXPECTED_RESPONSE come from this file, not from the server.
// message: a short sentence that can be shown to the user.
// details: the list of field problems for VALIDATION_ERROR, otherwise null.
// data:    the whole error object from the server, so extra fields such as
//          currentVersion (on VERSION_CONFLICT) are not lost. null if there was none.
export class ApiRequestError extends Error {
  constructor({ status, code, message, details = null, data = null }) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.data = data;
  }
}

// Calls the API and returns the parsed JSON answer, or null when the answer has no body
// (for example 204 No Content). Throws ApiRequestError when the call fails.
// Example: await request('POST', '/api/auth/login', { email, password })
export async function request(method, path, body) {
  const options = {
    method,
    credentials: 'include', // send the tv_token login cookie
    headers: {},
  };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(API_URL + path, options);
  } catch {
    // fetch itself failed: no connection, or nothing is running at that address.
    throw new ApiRequestError({ status: 0, code: 'NETWORK_ERROR', message: NETWORK_MESSAGE });
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = undefined; // the answer was not JSON
    }
  }

  if (response.ok) {
    if (data === undefined) {
      throw new ApiRequestError({
        status: response.status,
        code: 'UNEXPECTED_RESPONSE',
        message: UNEXPECTED_MESSAGE,
      });
    }
    return data; // null for 204 or any empty answer
  }

  // A failed answer in the shared error format.
  const error = data?.error;
  if (error && typeof error.code === 'string') {
    throw new ApiRequestError({
      status: response.status,
      code: error.code,
      message: error.message || UNEXPECTED_MESSAGE,
      details: error.details ?? null,
      data: error,
    });
  }

  // A failed answer without the shared format, for example a 502 page from a proxy.
  throw new ApiRequestError({
    status: response.status,
    code: 'UNEXPECTED_RESPONSE',
    message: UNEXPECTED_MESSAGE,
  });
}
