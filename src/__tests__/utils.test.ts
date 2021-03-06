import { describe, it, expect } from '@jest/globals';
import { makeUniqueKey } from '../utils';

describe('makeUniqueKey', () => {
  it('Should return a key as `method:url` when it is a normal request', () => {
    const method = 'POST';
    const url = 'http://localhost:3000/route';
    const request = {
      id: '1',
      headers: {},
      method: method,
      body: undefined,
      url: new URL(url),
    };

    expect(makeUniqueKey(request)).toBe(`${method}:${url}`);
  });
});
