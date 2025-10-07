# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-27

### Added
- Initial release of useApi library
- **Framework-agnostic design** - works with React, Next.js, Node.js, or any JavaScript environment
- **Config injection system** - inject your own functions for auth, i18n, and notifications
- Core API class (`ApiCore`) with full HTTP method support (GET, POST, PUT, DELETE, PATCH)
- **Zero dependencies** - built on native Fetch API
- TypeScript support with comprehensive type definitions
- Built-in error handling with customizable toast notifications
- Automatic token handling with Bearer authentication
- Language support with Accept-Language headers
- Search parameters support with config injection
- Request/response interceptors support
- Query parameters handling
- Timeout support with AbortController
- Comprehensive test suite with Jest
- Full documentation and examples
- Rollup build configuration for multiple output formats (CJS, ESM)
- ESLint and TypeScript configuration
- MIT license

### Features
- **Zero Dependencies**: Built on native Fetch API
- **Framework Agnostic**: Works with any JavaScript environment
- **Type Safe**: Full TypeScript support with generics
- **Config Injection**: Inject custom functions for auth, i18n, and notifications
- **Error Handling**: Unified error management with customizable feedback
- **i18n Ready**: Built-in language support with Accept-Language headers
- **Auth Ready**: Automatic token handling with Bearer authentication
- **DevEx Focused**: Simple, consistent API that reduces boilerplate
- **Testing Ready**: Comprehensive test utilities and mocking support

### API Methods
- `api.get<T>(endpoint, options?)` - GET requests
- `api.post<T>(endpoint, data?, options?)` - POST requests
- `api.put<T>(endpoint, data?, options?)` - PUT requests
- `api.delete<T>(endpoint, options?)` - DELETE requests
- `api.patch<T>(endpoint, data?, options?)` - PATCH requests
- `api.request<T>(method, endpoint, data?, options?)` - Generic request method

### Factory Functions
- `createApi(config)` - Create configured API instance
- `createSimpleApi(baseUrl, options?)` - Create simple API instance
- `createAuthenticatedApi(baseUrl, getToken, options?)` - Create authenticated API
- `createI18nApi(baseUrl, getLang, options?)` - Create i18n-enabled API
- `createFullApi(baseUrl, getToken, getLang, showToast, options?)` - Create fully configured API

### React Adapter (Optional)
- `useApi<T>(apiCall, options?)` - Basic API state management
- `useApiMultiple<T>(apiCalls, options?)` - Multiple API calls management
- `useApiWithRetry<T>(apiCall, options?)` - API calls with retry logic
- `useApiInstance(apiInstance)` - Hook for API instance
- `useApiQuery<T>(queryKey, apiCall, options?)` - React Query integration helper

### Configuration Options
- `baseUrl` - Base URL for all requests
- `getToken` - Function to retrieve authentication token
- `getLang` - Function to get current language
- `getSearchParams` - Function to get search parameters
- `showToast` - Function to show notifications
- `onUnauthorized` - Function to handle 401 errors
- `onError` - Global error handler
- `onSuccess` - Global success handler
- `onRequestStart` - Function to handle request start
- `onRequestEnd` - Function to handle request end
- `defaultHeaders` - Default headers for all requests
- `defaultTimeout` - Default request timeout
- `credentials` - Request credentials policy
- `fetch` - Custom fetch implementation

### Request Options
- `params` - Query parameters
- `query` - Include search params from config
- `msgs` - Show success/error messages
- `showLoading` - Show loading state
- `showErrorToast` - Show error toast
- `showSuccessToast` - Show success toast
- `requireAuth` - Include authentication token
- `headers` - Custom headers
- `timeout` - Request timeout
- `errorMessage` - Custom error message
- `successMessage` - Custom success message
- `fetchOptions` - Additional fetch options

### Response Format
All API responses follow a consistent format:
```typescript
{
  isError: boolean;
  data?: T;
  message?: string;
  status: number;
  meta?: Record<string, any>;
}
```

### Browser Support
- Modern browsers with Fetch API support
- Node.js 16+ for server-side usage
- React 18+ for hook functionality (optional adapter)

### Package Information
- **Package Name**: `@ajar/use-api-lib`
- **Version**: 1.0.0
- **License**: MIT
- **Main Entry**: `dist/index.js`
- **Module Entry**: `dist/index.esm.js`
- **Type Definitions**: `dist/index.d.ts`
- **Bundle Size**: ~15KB (minified, gzipped)
- **Dependencies**: 0 (zero dependencies)
- **Peer Dependencies**: None (framework-agnostic)

### Breaking Changes
- This is the initial release, so no breaking changes from previous versions

### Migration Notes
- This library is designed to be framework-agnostic
- For React users, use the optional React adapter
- No migration needed as this is the first release
