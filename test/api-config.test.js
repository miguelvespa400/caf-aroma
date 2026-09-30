import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiUrl } from '../public/api-config.js';

test('resolveApiUrl usa o backend local quando a página é servida pelo Live Server', () => {
  const originalLocation = globalThis.location;

  Object.defineProperty(globalThis, 'location', {
    value: new URL('http://127.0.0.1:5500/public/produtos.html'),
    configurable: true,
  });

  try {
    assert.equal(resolveApiUrl('/api/produtos'), 'http://localhost:3000/api/produtos');
  } finally {
    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      configurable: true,
    });
  }
});

test('resolveApiUrl usa a mesma origem quando a API já está no servidor do app', () => {
  const originalLocation = globalThis.location;

  Object.defineProperty(globalThis, 'location', {
    value: new URL('http://localhost:3000/produtos.html'),
    configurable: true,
  });

  try {
    assert.equal(resolveApiUrl('/api/produtos'), 'http://localhost:3000/api/produtos');
  } finally {
    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      configurable: true,
    });
  }
});
