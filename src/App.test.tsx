import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock fetch globally
global.fetch = vi.fn();

describe('App Component', () => {
  it('renders the dashboard tab by default and fetches data', async () => {
    // Setup mock responses for the three fetch calls in useEffect
    (global.fetch as any).mockImplementation((url: string) => {
      if (url === '/api/repositories') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url === '/api/pull-requests') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url === '/api/reviews/history') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: false });
    });

    render(<App />);
    
    // Check if the Sidebar renders the correct branding (GitHub Pull Request Review Agent)
    expect(screen.getByText('GitHub Pull Request Review Agent')).toBeInTheDocument();
    
    // Check if fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/repositories');
      expect(global.fetch).toHaveBeenCalledWith('/api/pull-requests');
    });
  });
});
