import { ApiResponse } from "../interface/response";
import { MovieRepository } from "@/core/ports/movie.repository";
import { Movie, CreateMovie } from "@/core/domain/movie";
import httpClient from "@/lib/http";
import { parseSchema } from "@/lib/validation";
import { movieSchema, createMovieSchema } from "@/core/schema/movie";

export class MovieRepositoryImpl implements MovieRepository {
    async getAllMovies(): Promise<ApiResponse<Movie[]>> {
        const response = await httpClient.get<Movie[]>("/movie/all");
        return response;
    }
    async getMovieById(id: string): Promise<ApiResponse<Movie>> {
        const response = await httpClient.get<Movie>(`/movie/${id}`);
        return response;
    }
    async searchMovies(query: string): Promise<ApiResponse<Movie[]>> {
        const response = await httpClient.get<Movie[]>(`/movie/search?q=${query}`);
        return response;
    }
    async getMoviesByCategory(category: string): Promise<ApiResponse<Movie[]>> {
        const response = await httpClient.get<Movie[]>(`/movie/category/${category}`);
        return response;
    }
    async createMovie(movie: CreateMovie): Promise<ApiResponse<Movie>> {
        const validated = parseSchema(createMovieSchema, movie);
        const response = await httpClient.post<Movie>("/movie", validated);
        return response;
    }
    async updateMovie(movie: Movie): Promise<ApiResponse<Movie>> {
        const validated = parseSchema(movieSchema, movie);
        const response = await httpClient.put<Movie>(`/movie/${validated.id}`, validated);
        return response;
    }
    async deleteMovie(id: string): Promise<ApiResponse<Movie>> {
        const response = await httpClient.delete<Movie>(`/movie/${id}`);
        return response;
    }
    async getFavorites(): Promise<ApiResponse<string[]>> {
        const response = await httpClient.get<string[]>("/movie/favorites");
        return response;
    }
    async addFavorite(movieId: string): Promise<ApiResponse<void>> {
        const response = await httpClient.post<void>("/movie/favorites", { movieId });
        return response;
    }
    async removeFavorite(movieId: string): Promise<ApiResponse<void>> {
        const response = await httpClient.delete<void>(`/movie/favorites/${movieId}`);
        return response;
    }
}