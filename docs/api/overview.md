# API Overview & Standards

The Finance Tracker REST API is mounted under the `/api/v1` namespace. All communication is JSON-based over standard HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`).

---

## Base URL

| Environment | Base URL |
| :--- | :--- |
| Production Container / Reverse Proxy | `http(s)://your-host:3004/api/v1` |
| Local Backend Dev Server | `http://localhost:4000/api/v1` |

---

## Response Envelope Standard

Every API response conforms to a consistent JSON envelope schema:

### Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 128,
    "totalPages": 3
  }
}
```
*Note: `meta` is present on paginated resource listings.*

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "amount",
        "message": "Expected positive number"
      }
    ]
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Use Case |
| :--- | :--- | :--- |
| `200 OK` | Success | Successful read or update operation. |
| `201 Created` | Created | Resource successfully created. |
| `204 No Content` | No Content | Successful deletion. |
| `400 Bad Request` | Bad Request | Zod validation failure or malformed payload. |
| `401 Unauthorized` | Unauthorized | Missing or expired JWT session cookie. |
| `403 Forbidden` | Forbidden | Insufficient permissions for requested resource. |
| `404 Not Found` | Not Found | Requested entity does not exist. |
| `409 Conflict` | Conflict | Duplicate unique constraint (e.g. duplicate email). |
| `429 Too Many Requests` | Rate Limited | Exceeded per-minute request rate limit. |
| `500 Server Error` | Internal Error | Unhandled server error. |

---

## Rate Limiting

The API enforces tiered rate limiting via `express-rate-limit`:
- **General API (`/api/v1/*`):** 300 requests per 15-minute window per IP.
- **Authentication (`/api/v1/auth/login`):** 10 attempts per 15-minute window per IP to defend against credential brute-forcing.
