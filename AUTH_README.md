# Authentication System Documentation

## Overview

A complete authentication system has been implemented for the DBASS frontend application. The system includes login, signup, user session management, and a beautiful UI.

## Features

### 🔐 Authentication Pages
- **Login Page** - Users can sign in with email and password
- **Signup Page** - New users can create accounts
- **Smooth transitions** between login and signup modes
- **Form validation** with helpful error messages
- **Loading states** with spinners and toast notifications

### 🎨 UI/UX Features
- Beautiful gradient background with animated elements
- Responsive design (mobile-friendly)
- Password visibility toggle
- Real-time form validation
- Toast notifications for success/error states
- Smooth animations using Framer Motion

### 🔒 Security Features
- Password strength validation (minimum 8 characters)
- Email format validation
- Secure token storage using Zustand persist middleware
- Auth token automatically added to API requests

### 👤 User Session Management
- Persistent login (survives page refreshes)
- User info displayed in header when logged in
- Logout functionality
- Auth state management with Zustand

## File Structure

```
src/
├── pages/
│   └── AuthPage.tsx          # Main authentication page (login/signup)
├── store/
│   └── authStore.ts          # Zustand store for auth state
├── services/
│   └── api.ts                # API service with login/signup functions
├── types/
│   └── index.ts              # TypeScript interfaces for auth
└── components/
    └── Layout.tsx            # Updated with auth UI (user display, logout)
```

## API Integration

### Backend Endpoints

The frontend is configured to call these endpoints:

#### 1. **Login**
```
POST /dbas/api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "user@example.com",
      "avatar": "optional-avatar-url"
    },
    "token": "jwt-token-here"
  }
}
```

#### 2. **Signup**
```
POST /dbas/api/auth/signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "user@example.com",
      "avatar": "optional-avatar-url"
    },
    "token": "jwt-token-here"
  }
}
```

### Backend Implementation Checklist

When implementing the backend, ensure:

1. ✅ Create `/dbas/api/auth/login` endpoint
2. ✅ Create `/dbas/api/auth/signup` endpoint
3. ✅ Hash passwords before storing (use bcrypt or similar)
4. ✅ Generate JWT tokens for authentication
5. ✅ Validate email format on backend
6. ✅ Check for duplicate emails during signup
7. ✅ Return the response structure shown above
8. ✅ Implement token validation middleware for protected routes

## Usage

### Accessing the Auth Page

Navigate to `/auth` in your application:
```
http://localhost:5173/auth
```

### User Flow

1. **New User (Signup)**
   - User navigates to `/auth`
   - Clicks "Sign up" to switch to signup mode
   - Fills in name, email, password, and confirms password
   - Clicks "Create Account"
   - On success, user is logged in and redirected to dashboard (`/`)

2. **Existing User (Login)**
   - User navigates to `/auth`
   - Enters email and password
   - Clicks "Sign In"
   - On success, user is logged in and redirected to dashboard (`/`)

3. **Logout**
   - Click the "Logout" button in the header
   - User is logged out and redirected to `/auth`

### Checking Auth State

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { user, isAuthenticated, token } = useAuthStore();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.name}!</div>;
}
```

### Protected Routes (Optional Implementation)

You can create a protected route component:

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
```

Then wrap routes in `App.tsx`:
```typescript
<Route 
  path="/settings" 
  element={
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  } 
/>
```

## State Management

### Auth Store (Zustand)

```typescript
interface AuthStore {
  user: User | null;           // Current user info
  token: string | null;        // JWT token
  isAuthenticated: boolean;    // Auth status
  setAuth: (user, token) => void;     // Login
  logout: () => void;          // Logout
  updateUser: (user) => void;  // Update user info
}
```

### Storage

- Auth state is persisted in `localStorage` under the key `auth-storage`
- Automatically syncs across browser tabs
- Survives page refreshes

## API Request Interceptor

The auth token is automatically added to all API requests:

```typescript
// In api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Testing Without Backend

The current implementation will show user-friendly error messages when backend endpoints are not available. To test the UI:

1. Navigate to `/auth`
2. Try filling out forms
3. Validation will work
4. API calls will fail gracefully with error toasts

## Customization

### Change API Endpoints

Update in `src/services/api.ts`:
```typescript
login: async (credentials: LoginRequest): Promise<AuthResponse> => {
  const { data } = await searchApi.post<AuthResponse>('/your-custom-endpoint', credentials);
  return data;
}
```

### Modify Auth Response Structure

Update types in `src/types/index.ts`:
```typescript
export interface AuthResponse {
  // Modify structure to match your backend
}
```

### Styling

All styles use Tailwind CSS and can be customized in:
- `src/pages/AuthPage.tsx` - Main auth page styling
- `src/components/Layout.tsx` - Header auth UI

## Environment Variables

Ensure these are set in your `.env` file:

```env
VITE_SEARCH_API_URL=https://dbaas-api.apexneural.cloud/dbas/api
VITE_API_BASE_URL=https://dbaas-api.apexneural.cloud/dbas/api
```

## Next Steps

1. **Implement Backend APIs**
   - Create the `/auth/login` and `/auth/signup` endpoints
   - Return responses matching the expected format

2. **Add Password Reset**
   - Create "Forgot Password" flow
   - Implement email verification

3. **Social Auth (Optional)**
   - Add Google/GitHub OAuth buttons
   - Implement OAuth flow

4. **Protected Routes**
   - Wrap sensitive pages with `ProtectedRoute` component
   - Redirect unauthenticated users to `/auth`

5. **Token Refresh**
   - Implement token refresh logic
   - Handle expired tokens gracefully

## Troubleshooting

### "Login failed" error
- Check if backend endpoints are running
- Verify API base URL in environment variables
- Check browser console for detailed error messages

### Auth state not persisting
- Check browser localStorage for `auth-storage` key
- Ensure zustand persist is working correctly
- Clear localStorage and try again

### Token not sent in requests
- Check the axios interceptor in `api.ts`
- Verify token is stored in auth store
- Check network tab for `Authorization` header

## Support

For issues or questions, check:
- Browser console for error logs
- Network tab for API request/response details
- `AUTH_README.md` (this file) for documentation

