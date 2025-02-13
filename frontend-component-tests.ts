import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Insights } from '../Insights';

describe('Insights Component', () => {
  const mockInsights = [
    {
      id: '1',
      type: 'TREND',
      category: 'CONVERSION',
      severity: 'HIGH',
      content: {
        title: 'Low Conversion Rate',
        description: 'Your conversion rate is below target',
        metrics: {
          currentRate: 1.5,
          targetRate: 3.0
        },
        recommendations: [
          'Optimize your CTA placement',
          'Improve page load times'
        ]
      },
      createdAt: '2025-02-13T12:00:00Z'
    }
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(() => {})
    );

    render(<Insights partnerId="test-partner" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays insights when data is loaded', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ insights: mockInsights })
      })
    );

    render(<Insights partnerId="test-partner" />);

    await waitFor(() => {
      expect(screen.getByText('Low Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText(/your conversion rate is below target/i)).toBeInTheDocument();
    });
  });

  it('displays error state when fetch fails', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch'))
    );

    render(<Insights partnerId="test-partner" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('renders insights with correct severity styling', async () => {
    const insightsWithDifferentSeverities = [
      { ...mockInsights[0], severity: 'HIGH' },
      { ...mockInsights[0], id: '2', severity: 'MEDIUM' },
      { ...mockInsights[0], id: '3', severity: 'LOW' }
    ];

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ insights: insightsWithDifferentSeverities })
      })
    );

    render(<Insights partnerId="test-partner" />);

    await waitFor(() => {
      const cards = screen.getAllByRole('article');
      expect(cards[0]).toHaveClass('bg-red-50');
      expect(cards[1]).toHaveClass('bg-yellow-50');
      expect(cards[2]).toHaveClass('bg-green-50');
    });
  });

  it('displays empty state when no insights are available', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ insights: [] })
      })
    );

    render(<Insights partnerId="test-partner" />);

    await waitFor(() => {
      expect(screen.getByText(/no insights available/i)).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ insights: mockInsights })
      })
    );

    render(<Insights partnerId="test-partner" />);

    await waitFor(() => {
      const dateString = screen.getByText(/generated/i);
      expect(dateString).toHaveTextContent(
        expect.stringContaining('2/13/2025')
      );
    });
  });

  it('displays recommendations when available', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ insights: mockInsights })
      })
    );

    render(<Insights partnerId="test-partner" />);

    await waitFor(() => {
      expect(screen.getByText('Recommendations:')).toBeInTheDocument();
      expect(screen.getByText('Optimize your CTA placement')).toBeInTheDocument();
      expect(screen.getByText('Improve page load times')).toBeInTheDocument();
    });
  });

  it('displays metrics in a formatted way', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ insights: mockInsights })
      })
    );

    render(<Insights partnerId="test-partner" />);

    await waitFor(() => {
      expect(screen.getByText('1.5')).toBeInTheDocument();
      expect(screen.getByText('3.0')).toBeInTheDocument();
    });
  });
});