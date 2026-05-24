import { Movie, CreateMovie, UpdateMovie } from "../domain/movie";
import { MovieRepository } from "../ports/movie.repository";

export class MovieService {
    constructor(private readonly movieRepository: MovieRepository) { }
    async getAllMovies(): Promise<Movie[]> {
        const response = await this.movieRepository.getAllMovies();
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
    async getMovieById(id: string): Promise<Movie> {
        const response = await this.movieRepository.getMovieById(id);
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
    async searchMovies(query: string): Promise<Movie[]> {
        const response = await this.movieRepository.searchMovies(query);
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
    async getMoviesByCategory(category: string): Promise<Movie[]> {
        const response = await this.movieRepository.getMoviesByCategory(category);
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
    async createMovie(movie: CreateMovie): Promise<Movie> {
        const response = await this.movieRepository.createMovie(movie);
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
    async updateMovie(id: string, movie: UpdateMovie): Promise<Movie> {
        const response = await this.movieRepository.updateMovie(id, movie);
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
    async deleteMovie(id: string): Promise<void> {
        const response = await this.movieRepository.deleteMovie(id);
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
    async getFavorites(): Promise<string[]> {
        const response = await this.movieRepository.getFavorites();
        if (response.error) {
            throw response.error;
        }
        return response.data;
    }
    async addFavorite(movieId: string): Promise<void> {
        const response = await this.movieRepository.addFavorite(movieId);
        if (response.error) {
            throw response.error;
        }
    }
    async removeFavorite(movieId: string): Promise<void> {
        const response = await this.movieRepository.removeFavorite(movieId);
        if (response.error) {
            throw response.error;
        }
    }
}