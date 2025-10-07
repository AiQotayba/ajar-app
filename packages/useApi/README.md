# 🚀 useApi Library

[![npm version](https://badge.fury.io/js/%40ajar%2Fuse-api-lib.svg)](https://badge.fury.io/js/%40ajar%2Fuse-api-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

> A lightweight, framework-agnostic API layer with config injection for auth, i18n, and error handling.

## ✨ Features

- 🪶 **Zero Dependencies** - Built on native Fetch API
- 🧩 **Framework Agnostic** - Works with React, Next.js, Node.js, or any JavaScript environment
- 🔧 **Config Injection** - Inject your own functions for auth, i18n, and notifications
- 🎯 **Type Safe** - Full TypeScript support with generics
- 🌍 **i18n Ready** - Built-in language support
- 🔐 **Auth Ready** - Automatic token handling
- 📱 **Error Handling** - Unified error management with customizable feedback
- 🎨 **DevEx Focused** - Simple, consistent API that reduces boilerplate
- ⚡ **Lightweight** - ~15KB minified, gzipped

## 📦 Installation

```bash
npm install @ajar/use-api-lib
# or
yarn add @ajar/use-api-lib
# or
pnpm add @ajar/use-api-lib
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { createApi } from '@ajar/use-api-lib';

const api = createApi({
  baseUrl: 'https://api.example.com',
  getToken: () => localStorage.getItem('token'),
  showToast: (message, type) => toast[type](message),
  getLang: () => 'ar',
});

// Use the API
const response = await api.get('/users');
```

### With React (Optional Adapter)

```typescript
import { createApi } from '@ajar/use-api-lib';
import { useApi } from '@ajar/use-api-lib/react-adapter';

const api = createApi({
  baseUrl: 'https://api.example.com',
  getToken: () => localStorage.getItem('token'),
  showToast: (message, type) => toast[type](message),
  getLang: () => 'ar',
});

function UserProfile() {
  const { data, isLoading, isError, execute } = useApi(
    () => api.get('/user/profile'),
    { immediate: true }
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error occurred</div>;

  return <div>{data?.name}</div>;
}
```

## 📚 API Reference

### `createApi(config)`

Creates a configured API instance.

#### Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `baseUrl` | `string` | ✅ | Base URL for all API requests |
| `getToken` | `() => string \| null` | ❌ | Function to get authentication token |
| `getLang` | `() => string` | ❌ | Function to get current language |
| `getSearchParams` | `() => string \| URLSearchParams \| Record<string, any>` | ❌ | Function to get search parameters |
| `showToast` | `(message: string, type: ToastType) => void` | ❌ | Function to show notifications |
| `onUnauthorized` | `() => void` | ❌ | Function to handle 401 errors |
| `onError` | `(error: Error, response?: Response) => void` | ❌ | Global error handler |
| `onSuccess` | `(response: ApiResponse) => void` | ❌ | Global success handler |
| `defaultHeaders` | `Record<string, string>` | ❌ | Default headers for all requests |
| `defaultTimeout` | `number` | ❌ | Default request timeout (ms) |
| `credentials` | `RequestCredentials` | ❌ | Request credentials policy |
| `fetch` | `typeof fetch` | ❌ | Custom fetch implementation |

### API Methods

#### `api.get<T>(endpoint, options?)`
```typescript
const users = await api.get<User[]>('/users');
```

#### `api.post<T>(endpoint, data?, options?)`
```typescript
const newUser = await api.post<User>('/users', { name: 'John' });
```

#### `api.put<T>(endpoint, data?, options?)`
```typescript
const updatedUser = await api.put<User>('/users/1', { name: 'Jane' });
```

#### `api.delete<T>(endpoint, options?)`
```typescript
await api.delete('/users/1');
```

#### `api.patch<T>(endpoint, data?, options?)`
```typescript
const patchedUser = await api.patch<User>('/users/1', { name: 'Updated' });
```

### Request Options

```typescript
const response = await api.get('/users', {
  params: { page: 1, limit: 10 },        // Query parameters
  query: true,                           // Include search params from config
  msgs: true,                           // Show success/error messages
  showSuccessToast: true,               // Show success toast
  showErrorToast: false,                // Don't show error toast
  headers: { 'Custom-Header': 'value' }, // Custom headers
  timeout: 5000,                        // Request timeout
  errorMessage: 'Custom error message', // Custom error message
  fetchOptions: {                       // Additional fetch options
    cache: 'no-cache',
  },
});
```

## 🎣 React Hooks (Optional)

### `useApi<T>(apiCall, options?)`

Manages API request state with React hooks.

```typescript
const { data, isLoading, isError, error, execute, reset } = useApi(
  () => api.get<User>('/user/profile'),
  {
    immediate: true,
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error)
  }
);
```

### `useApiMultiple<T>(apiCalls, options?)`

Manages multiple API calls simultaneously.

```typescript
const { results, isLoading, isError, executeAll } = useApiMultiple([
  () => api.get('/users'),
  () => api.get('/posts'),
  () => api.get('/comments')
]);
```

### `useApiWithRetry<T>(apiCall, options?)`

Manages API calls with automatic retry logic.

```typescript
const { data, isLoading, retryCount, execute } = useApiWithRetry(
  () => api.get('/unstable-endpoint'),
  {
    maxRetries: 3,
    retryDelay: 1000,
    retryCondition: (error) => error.status >= 500
  }
);
```

## 🌍 Internationalization

The library automatically includes language headers when `getLang` is provided:

```typescript
const api = createApi({
  baseUrl: 'https://api.example.com',
  getLang: () => currentLocale, // 'ar', 'en', etc.
});

// All requests will include: Accept-Language: ar
```

## 🔐 Authentication

Automatic token handling when `getToken` is provided:

```typescript
const api = createApi({
  baseUrl: 'https://api.example.com',
  getToken: () => localStorage.getItem('authToken'),
});

// All requests will include: Authorization: Bearer <token>
```

## 🎨 Error Handling

Unified error handling with customizable notifications:

```typescript
const api = createApi({
  baseUrl: 'https://api.example.com',
  showToast: (message, type) => {
    // Using react-hot-toast
    toast[type](message);
    
    // Or using sonner
    toast[type](message);
    
    // Or custom notification system
    notification.show(message, type);
  },
  onError: (error, response) => {
    // Custom error handling
    console.error('API Error:', error);
    analytics.track('api_error', { error: error.message });
  },
  onUnauthorized: () => {
    // Handle 401 errors
    window.location.href = '/login';
  }
});
```

## 🔧 Advanced Configuration

### Custom Fetch Implementation

```typescript
const api = createApi({
  baseUrl: 'https://api.example.com',
  fetch: customFetch, // Your custom fetch implementation
});
```

### Search Parameters

```typescript
const api = createApi({
  baseUrl: 'https://api.example.com',
  getSearchParams: () => {
    // Return URLSearchParams, string, or object
    return new URLSearchParams({ version: 'v1', format: 'json' });
  },
});

// Use with query: true
const response = await api.get('/users', { query: true });
// URL: https://api.example.com/users?version=v1&format=json
```

### Factory Functions

```typescript
// Simple API
const simpleApi = createSimpleApi('https://api.example.com');

// Authenticated API
const authApi = createAuthenticatedApi(
  'https://api.example.com',
  () => localStorage.getItem('token')
);

// i18n API
const i18nApi = createI18nApi(
  'https://api.example.com',
  () => 'ar'
);

// Full API
const fullApi = createFullApi(
  'https://api.example.com',
  () => localStorage.getItem('token'),
  () => 'ar',
  (message, type) => toast[type](message)
);
```

## 🧪 Testing

```typescript
import { createApi } from '@ajar/use-api-lib';

// Mock the API for testing
const mockApi = createApi({
  baseUrl: 'https://test-api.com',
  fetch: jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: { id: 1, name: 'Test' } })
  })
});

test('should fetch user data', async () => {
  const response = await mockApi.get('/user');
  expect(response.data).toEqual({ id: 1, name: 'Test' });
});
```

## 📊 Comparison with Other Libraries

| Feature | useApi | SWR | React Query |
|---------|--------|-----|-------------|
| Bundle Size | 🪶 Tiny (0 deps) | 📦 Medium | 📦 Large |
| Framework Support | 🌍 Any | React only | React only |
| Fetch Method | Native Fetch | Fetch | Fetch |
| Caching | Optional (external) | Built-in | Built-in |
| DevEx | 🎯 Simple & Flexible | Good | Advanced |
| Customization | 🔧 High | Limited | Limited |
| i18n Support | 🌍 Built-in | Manual | Manual |
| Auth Support | 🔐 Built-in | Manual | Manual |
| Error Handling | 🎨 Built-in | External | External |
| Config Injection | ✅ Yes | No | No |

## 🎯 Use Cases

- **Simple API calls** with minimal setup
- **Form submissions** with loading states
- **Data fetching** in any JavaScript environment
- **Authentication flows** with token management
- **Internationalized applications** with language support
- **Error handling** with user-friendly notifications
- **Testing** with easy mocking capabilities
- **Node.js applications** with server-side API calls

## 🔄 Migration from React-Only Libraries

### From SWR/React Query

```typescript
// Before (SWR)
import useSWR from 'swr';
const { data, error, isLoading } = useSWR('/api/users', fetcher);

// After (useApi)
import { createApi } from '@ajar/use-api-lib';
import { useApi } from '@ajar/use-api-lib/react-adapter';

const api = createApi({ baseUrl: '/api' });
const { data, isLoading, isError } = useApi(() => api.get('/users'));
```

### From Axios

```typescript
// Before (Axios)
import axios from 'axios';
const response = await axios.get('/api/users');

// After (useApi)
import { createApi } from '@ajar/use-api-lib';
const api = createApi({ baseUrl: '/api' });
const response = await api.get('/users');
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by [Qutaiba](https://github.com/qutaiba)
- Inspired by modern API client patterns
- Designed for optimal Developer Experience (DevEx)

---

**Made with ❤️ for the JavaScript community**
