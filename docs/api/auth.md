# Authentication & Session API

Finance Tracker utilizes stateless JSON Web Tokens (JWT) transmitted via HTTP-only, secure, `SameSite=Strict` cookies named `auth_token`. Passwords are hashed with memory-hard **Argon2id**.

---

## Endpoints

### 1. User Registration
Creates a new account and immediately establishes an authenticated session.

- **Method:** `POST /api/v1/auth/register`
- **Rate Limit:** 10 requests / 15 minutes.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "your-secure-password-min-8-chars",
  "displayName": "Financial Admin"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "e98e2fcb-17ef-4171-87bb-d76077ff02bc",
      "email": "user@example.com",
      "displayName": "Financial Admin",
      "createdAt": "2026-11-17T10:00:00.000Z"
    }
  }
}
```
*Note: A `Set-Cookie` header is returned with the encrypted `auth_token`.*

---

### 2. User Login
Authenticates an existing user and sets the session cookie.

- **Method:** `POST /api/v1/auth/login`
- **Rate Limit:** 10 requests / 15 minutes.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "your-secure-password-min-8-chars"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "e98e2fcb-17ef-4171-87bb-d76077ff02bc",
      "email": "user@example.com",
      "displayName": "Financial Admin"
    }
  }
}
```

---

### 3. User Logout
Invalidates the client's session cookie.

- **Method:** `POST /api/v1/auth/logout`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

### 4. Current User Session
Returns the authenticated identity of the active session.

- **Method:** `GET /api/v1/auth/me`
- **Authentication:** Required (HTTP-only cookie).

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "e98e2fcb-17ef-4171-87bb-d76077ff02bc",
      "email": "user@example.com",
      "displayName": "Financial Admin",
      "createdAt": "2026-11-17T10:00:00.000Z"
    }
  }
}
```

---

### 5. Change Password
Updates the user's password after validating the existing credential.

- **Method:** `PUT /api/v1/auth/password`
- **Authentication:** Required.

#### Request Body
```json
{
  "currentPassword": "old-secure-password",
  "newPassword": "new-secure-password-min-8-chars"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```
