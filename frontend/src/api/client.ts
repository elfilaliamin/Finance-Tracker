export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiError extends Error {
  code: string;
  details?: any;
  status: number;

  constructor(message: string, code: string = 'API_ERROR', status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle blob or stream downloads (e.g. CSV, XLSX, PDF exports, or attachment downloads like JSON backups)
  const contentType = response.headers.get('content-type') || '';
  const contentDisposition = response.headers.get('content-disposition') || '';
  if (
    contentDisposition.includes('attachment') ||
    contentType.includes('text/csv') ||
    contentType.includes('application/vnd.openxmlformats') ||
    contentType.includes('application/pdf') ||
    contentType.includes('application/octet-stream')
  ) {
    if (!response.ok) {
      throw new ApiError('Export failed', 'EXPORT_ERROR', response.status);
    }
    return (await response.blob()) as unknown as T;
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}`, 'HTTP_ERROR', response.status);
    }
    return {} as T;
  }

  if (!response.ok || json.status === 'error' || (json as any).success === false) {
    let errorMsg = json.error?.message || `Request failed with status ${response.status}`;
    if (json.error?.details && Array.isArray(json.error.details) && json.error.details.length > 0) {
      const detailsStr = json.error.details
        .map((d: any) => (d.issue ? (d.field ? `${d.field}: ${d.issue}` : d.issue) : ''))
        .filter(Boolean)
        .join(', ');
      if (detailsStr) {
        errorMsg = detailsStr;
      }
    }
    const errorCode = json.error?.code || 'UNKNOWN_ERROR';
    throw new ApiError(errorMsg, errorCode, response.status, json.error?.details);
  }

  return json.data as T;
}

export const api = {
  get: <T>(endpoint: string, query?: Record<string, any>) => {
    let url = endpoint;
    if (query) {
      const searchParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return request<T>(url, { method: 'GET' });
  },

  post: <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put: <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch: <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete: <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'DELETE',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  download: async (endpoint: string, filename: string, query?: Record<string, any>) => {
    const blob = await api.get<Blob>(endpoint, query);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  },
};

