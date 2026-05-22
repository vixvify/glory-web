import { ApiResponse } from "@/infra/interface/response";
import { Movie, CreateMovie } from "../domain/movie";

export interface MovieRepository {
    getAllMovies(): Promise<ApiResponse<Movie[]>>;
    getMovieById(id: string): Promise<ApiResponse<Movie>>;
    searchMovies(query: string): Promise<ApiResponse<Movie[]>>;
    getMoviesByCategory(category: string): Promise<ApiResponse<Movie[]>>;
    createMovie(movie: CreateMovie): Promise<ApiResponse<Movie>>;
    updateMovie(movie: Movie): Promise<ApiResponse<Movie>>;
    deleteMovie(id: string): Promise<ApiResponse<Movie>>;
    getFavorites(): Promise<ApiResponse<string[]>>;
    addFavorite(movieId: string): Promise<ApiResponse<void>>;
    removeFavorite(movieId: string): Promise<ApiResponse<void>>;
}