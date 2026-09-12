import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {SearchIcon} from '../components/atoms/SearchIcon';

describe('SearchIcon', () => {
  it('renders a decorative magnifying glass', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SearchIcon color="#111111" testID="search-icon" />,
      );
    });

    expect(tree!.root.findByProps({testID: 'search-icon'})).toBeTruthy();
  });
});
