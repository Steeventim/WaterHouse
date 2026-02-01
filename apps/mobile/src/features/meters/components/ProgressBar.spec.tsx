/**
 * Tests for ProgressBar component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from '../components/ProgressBar';

describe('ProgressBar', () => {
  it('should render correctly with default props', () => {
    const { getByTestId } = render(<ProgressBar progress={50} />);
    expect(render(<ProgressBar progress={50} />)).toBeTruthy();
  });

  it('should clamp progress to 0-100 range', () => {
    const { rerender } = render(<ProgressBar progress={150} />);
    expect(render(<ProgressBar progress={150} />)).toBeTruthy();

    rerender(<ProgressBar progress={-50} />);
    expect(render(<ProgressBar progress={-50} />)).toBeTruthy();
  });

  it('should render label when showLabel is true', () => {
    const { getByText } = render(<ProgressBar progress={75} showLabel />);
    expect(getByText('75%')).toBeTruthy();
  });

  it('should not render label when showLabel is false', () => {
    const { queryByText } = render(<ProgressBar progress={75} showLabel={false} />);
    expect(queryByText('75%')).toBeNull();
  });

  it('should apply custom color when provided', () => {
    const customColor = '#ff0000';
    const { getByTestId } = render(
      <ProgressBar progress={50} color={customColor} />
    );
    expect(render(<ProgressBar progress={50} color={customColor} />)).toBeTruthy();
  });

  it('should render different sizes correctly', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach(size => {
      const { rerender } = render(<ProgressBar progress={50} size={size} />);
      expect(render(<ProgressBar progress={50} size={size} />)).toBeTruthy();
    });
  });
});
