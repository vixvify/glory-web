import { Movie, CreateMovie, UpdateMovie } from "../domain/movie";
import { MovieRepository } from "../ports/movie.repository";
import { parseSchema } from "@/lib/validation";
import { createMovieSchema, updateMovieSchema } from "../schema/movie";

export class MovieService {
    constructor(private readonly movieRepository: MovieRepository) { }
    async getAllMovies(): Promise<Movie[]> {
        try {
            const response = await this.movieRepository.getAllMovies();
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        } catch (error) {
            console.error("Error in getAllMovies:", error);
            throw error;
        }
    }
    async getMovieById(id: string): Promise<Movie> {
        try {
            const response = await this.movieRepository.getMovieById(id);
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        } catch (error) {
            console.error(`Error in getMovieById (id: ${id}):`, error);
            throw error;
        }
    }
    async searchMovies(query: string): Promise<Movie[]> {
        try {
            const response = await this.movieRepository.searchMovies(query);
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        } catch (error) {
            console.error(`Error in searchMovies (query: ${query}):`, error);
            throw error;
        }
    }
    async getMoviesByCategory(category: string): Promise<Movie[]> {
        try {
            const response = await this.movieRepository.getMoviesByCategory(category);
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        } catch (error) {
            console.error(`Error in getMoviesByCategory (category: ${category}):`, error);
            throw error;
        }
    }
    async createMovie(movie: CreateMovie): Promise<Movie> {
        try {
            const validated = parseSchema(createMovieSchema, movie);
            const formData = new FormData();
            formData.append("title", validated.title);
            formData.append("description", validated.description);
            formData.append("category", validated.category);
            formData.append("youtubeUrl", validated.youtubeUrl);
            formData.append("year", String(validated.year));
            formData.append("matchRate", String(validated.matchRate));
            formData.append("ageRating", validated.ageRating);
            formData.append("duration", String(validated.duration));

            if (validated.thumbnail instanceof File) {
                formData.append("thumbnail", validated.thumbnail);
            } else if (validated.thumbnail && typeof validated.thumbnail === "object" && "length" in validated.thumbnail) {
                const list = validated.thumbnail as unknown as FileList;
                if (list.length > 0) {
                    formData.append("thumbnail", list[0] as File);
                }
            }

            const response = await this.movieRepository.createMovie(formData);
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        } catch (error) {
            console.error("Error in createMovie:", error);
            throw error;
        }
    }
    async updateMovie(id: string, movie: UpdateMovie): Promise<Movie> {
        try {
            const validated = parseSchema(updateMovieSchema, movie);
            const formData = new FormData();
            formData.append("title", validated.title);
            formData.append("description", validated.description);
            formData.append("category", validated.category);
            formData.append("youtubeUrl", validated.youtubeUrl);
            formData.append("year", String(validated.year));
            formData.append("matchRate", String(validated.matchRate));
            formData.append("ageRating", validated.ageRating);
            formData.append("duration", String(validated.duration));

            if (validated.thumbnail instanceof File) {
                formData.append("thumbnail", validated.thumbnail);
            } else if (validated.thumbnail && typeof validated.thumbnail === "object" && "length" in validated.thumbnail && typeof validated.thumbnail !== "string") {
                const list = validated.thumbnail as unknown as FileList;
                if (list.length > 0) {
                    formData.append("thumbnail", list[0] as File);
                }
            } else if (typeof validated.thumbnail === "string") {
                formData.append("thumbnail", validated.thumbnail);
            }

            const response = await this.movieRepository.updateMovie(id, formData);
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        } catch (error) {
            console.error(`Error in updateMovie (id: ${id}):`, error);
            throw error;
        }
    }
    async deleteMovie(id: string): Promise<void> {
        try {
            const response = await this.movieRepository.deleteMovie(id);
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        } catch (error) {
            console.error(`Error in deleteMovie (id: ${id}):`, error);
            throw error;
        }
    }
    async getFavorites(): Promise<string[]> {
        try {
            const response = await this.movieRepository.getFavorites();
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        } catch (error) {
            console.error("Error in getFavorites:", error);
            throw error;
        }
    }
    async addFavorite(movieId: string): Promise<void> {
        try {
            const response = await this.movieRepository.addFavorite(movieId);
            if (response.error) {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error(`Error in addFavorite (movieId: ${movieId}):`, error);
            throw error;
        }
    }
    async removeFavorite(movieId: string): Promise<void> {
        try {
            const response = await this.movieRepository.removeFavorite(movieId);
            if (response.error) {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error(`Error in removeFavorite (movieId: ${movieId}):`, error);
            throw error;
        }
    }
    async getCategories(): Promise<string[]> {
        try {
            const response = await this.movieRepository.getCategories();
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        } catch (error) {
            console.error("Error in getCategories:", error);
            throw error;
        }
    }
    async getAgeRatings(): Promise<string[]> {
        try {
            const response = await this.movieRepository.getAgeRatings();
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        } catch (error) {
            console.error("Error in getAgeRatings:", error);
            throw error;
        }
    }
}