import { ApiResponse } from "../interface/response";
import httpClient from "@/lib/http";
import { AuthRepository } from "@/core/ports/auth.repository";
import { User, RegisterUser, LoginUser } from "@/core/domain/user";
import { parseSchema } from "@/lib/validation";
import { registerUserSchema, loginUserSchema } from "@/core/schema/auth";

export class AuthRepositoryImpl implements AuthRepository {
  async register(user: RegisterUser): Promise<ApiResponse<User>> {
    const validated = parseSchema(registerUserSchema, user);
    const response = await httpClient.post<User>("/auth/register", validated);
    return response;
  }
  async login(user: LoginUser): Promise<ApiResponse<User>> {
    const validated = parseSchema(loginUserSchema, user);
    const response = await httpClient.post<User>("/auth/login", validated);
    return response;
  }
  async logout(): Promise<ApiResponse<void>> {
    const response = await httpClient.post<void>("/auth/logout");
    return response;
  }
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await httpClient.get<User>("/auth/me");
    return response;
  }
}
