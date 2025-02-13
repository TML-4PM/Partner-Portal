import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class ServiceError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export const createServiceClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  client.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        throw new ServiceError(
          error.response.status,
          error.response.data.message || 'Service request failed',
          error.response.data.details
        );
      }
      throw new ServiceError(500, 'Service communication failed');
    }
  );

  return client;
};

export const handleServiceError = (error: any) => {
  if (error instanceof ServiceError) {
    return {
      status: error.statusCode,
      body: {
        error: error.message,
        details: error.details
      }
    };
  }
  return {
    status: 500,
    body: {
      error: 'Internal Server Error'
    }
  };
};

export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries - 1) break;
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const circuitBreaker = () => {
  let failures = 0;
  let lastFailureTime: number | null = null;
  const maxFailures = 5;
  const resetTimeout = 60000; // 1 minute

  return async <T>(operation: () => Promise<T>): Promise<T> => {
    if (failures >= maxFailures) {
      if (lastFailureTime && Date.now() - lastFailureTime < resetTimeout) {
        throw new ServiceError(503, 'Circuit breaker is open');
      }
      failures = 0;
    }

    try {
      const result = await operation();
      failures = 0;
      return result;
    } catch (error) {
      failures++;
      lastFailureTime = Date.now();
      throw error;
    }
  };
};