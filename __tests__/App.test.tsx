/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

const homeEnvelope = {
  contractVersion: '1.1',
  data: {slug: 'home', title: 'Casa Maíz', layout: []},
};

const bootstrapEnvelope = {
  contractVersion: '1.1',
  data: {
    navigation: {
      items: [
        {label: 'Inicio', destination: {path: '/'}},
        {label: 'Menú', destination: {path: '/menu'}},
      ],
    },
  },
};

beforeEach(() => {
  globalThis.fetch = jest.fn(async input => {
    const url = String(input);
    const body = url.includes('/bootstrap') ? bootstrapEnvelope : homeEnvelope;
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: {'Content-Type': 'application/json'},
    });
  }) as typeof fetch;
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
