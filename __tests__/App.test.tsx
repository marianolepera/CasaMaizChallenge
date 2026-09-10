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

beforeEach(() => {
  globalThis.fetch = jest.fn().mockResolvedValue(
    new Response(JSON.stringify(homeEnvelope), {
      status: 200,
      headers: {'Content-Type': 'application/json'},
    }),
  ) as typeof fetch;
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
