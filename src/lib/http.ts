import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { ApiResponse } from "@/infra/interface/response";

const http: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

http.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("thaiflix_auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleRequest = async <T>(
  requestFn: () => Promise<any>
): Promise<ApiResponse<T>> => {
  try {
    const response = await requestFn();
    return {
      data: response.data.data,
      status: response.data.status,
      statusCode: response.data?.statusCode || "SUCCESS",
    };
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status || 500;
    const errorData = axiosError.response?.data;

    return {
      data: null as unknown as T,
      error: errorData?.error || errorData?.message || axiosError.message || "An unexpected error occurred",
      status,
      statusCode: errorData?.statusCode || "ERROR",
    };
  }
};

export const httpClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => http.get(url, config)),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => http.post(url, data, config)),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => http.put(url, data, config)),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => http.delete(url, config)),
};

export default httpClient;
