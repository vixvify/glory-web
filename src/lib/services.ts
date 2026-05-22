import { MovieRepositoryImpl } from "@/infra/repositories/movie.repository";
import { AuthRepositoryImpl } from "@/infra/repositories/auth.repository";
import { MovieService } from "@/core/service/movie.service";
import { AuthService } from "@/core/service/auth.service";

const movieRepository = new MovieRepositoryImpl();
const authRepository = new AuthRepositoryImpl();

export const movieService = new MovieService(movieRepository);
export const authService = new AuthService(authRepository);
