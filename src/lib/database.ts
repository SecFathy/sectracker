
// Simple local database client for offline mode
class LocalDatabaseClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_DATABASE_URL || 'postgresql://localhost:5432/sectracker';
  }

  // Simple fetch wrapper for API calls
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `/api${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Database request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Mock auth methods for offline mode
  auth = {
    getSession: () => Promise.resolve({ data: { session: { user: { id: 'offline-user' } } } }),
    getUser: () => Promise.resolve({ data: { user: { id: 'offline-user' } } }),
    onAuthStateChange: (callback: Function) => {
      // Mock authenticated state
      callback('SIGNED_IN', { user: { id: 'offline-user' } });
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  };

  // Table operations
  from(table: string) {
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => this.request(`/${table}?${column}=eq.${value}`),
        order: (column: string, options: any = {}) => this.request(`/${table}?order=${column}.${options.ascending ? 'asc' : 'desc'}`),
        limit: (count: number) => this.request(`/${table}?limit=${count}`),
        single: () => this.request(`/${table}?limit=1`),
        maybeSingle: () => this.request(`/${table}?limit=1`).catch(() => null),
      }),
      insert: (data: any) => ({
        select: () => this.request(`/${table}`, { method: 'POST', body: JSON.stringify(data) }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => this.request(`/${table}?${column}=eq.${value}`, { method: 'PATCH', body: JSON.stringify(data) }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => this.request(`/${table}?${column}=eq.${value}`, { method: 'DELETE' }),
      }),
    };
  }
}

export const database = new LocalDatabaseClient();
