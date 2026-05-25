import { ApiResponse } from "@/infra/interface/response";
import { Movie } from "../domain/movie";

export interface MovieRepository {
    getAllMovies(): Promise<ApiResponse<Movie[]>>;
    getMovieById(id: string): Promise<ApiResponse<Movie>>;
    searchMovies(query: string): Promise<ApiResponse<Movie[]>>;
    getMoviesByCategory(category: string): Promise<ApiResponse<Movie[]>>;
    createMovie(formData: FormData): Promise<ApiResponse<Movie>>;
    updateMovie(id: string, formData: FormData): Promise<ApiResponse<Movie>>;
    deleteMovie(id: string): Promise<ApiResponse<void>>;
    getFavorites(): Promise<ApiResponse<string[]>>;
    addFavorite(movieId: string): Promise<ApiResponse<void>>;
    removeFavorite(movieId: string): Promise<ApiResponse<void>>;
    getCategories(): Promise<ApiResponse<string[]>>;
    getAgeRatings(): Promise<ApiResponse<string[]>>;
}