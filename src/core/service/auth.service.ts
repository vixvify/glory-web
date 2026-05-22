import { User, RegisterUser, LoginUser } from "../domain/user";
import { AuthRepository } from "../ports/auth.repository";

export class AuthService {
    constructor(private readonly authRepository: AuthRepository) { }
    async register(user: RegisterUser): Promise<User> {
        const response = await this.authRepository.register(user);
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
    async login(user: LoginUser): Promise<User> {
        const response = await this.authRepository.login(user);
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
    async logout(): Promise<void> {
        const response = await this.authRepository.logout();
        if (response.error) {
            throw response.error;
        }
    }
    async getCurrentUser(): Promise<User> {
        const response = await this.authRepository.getCurrentUser();
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
}