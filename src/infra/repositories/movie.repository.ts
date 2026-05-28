import { ApiResponse } from "../interface/response";
import { MovieRepository } from "@/core/ports/movie.repository";
import { Movie } from "@/core/domain/movie";
import httpClient from "@/lib/http";
import { RatingCheckInput, RatingInput, Rating } from "@/core/domain/rating";

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
    const response = await httpClient.get<Movie[]>(
      `/movie/category/${category}`,
    );
    return response;
  }
  async getMoviesByUniversity(university: string): Promise<ApiResponse<Movie[]>> {
    const response = await httpClient.get<Movie[]>(
      `/movie/university/${university}`,
    );
    return response;
  }
  async createMovie(formData: FormData): Promise<ApiResponse<Movie>> {
    const response = await httpClient.post<Movie>("/movie", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  }
  async updateMovie(
    id: string,
    formData: FormData,
  ): Promise<ApiResponse<Movie>> {
    const response = await httpClient.put<Movie>(`/movie/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  }
  async deleteMovie(id: string): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<void>(`/movie/${id}`);
    return response;
  }
  async getFavorites(): Promise<ApiResponse<Movie[]>> {
    const response = await httpClient.get<Movie[]>("/movie/favorites");
    return response;
  }
  async addFavorite(movieId: string): Promise<ApiResponse<void>> {
    const response = await httpClient.post<void>("/movie/favorites", {
      movieId,
    });
    return response;
  }
  async removeFavorite(movieId: string): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<void>(
      `/movie/favorites/${movieId}`,
    );
    return response;
  }
  async getCategories(): Promise<ApiResponse<string[]>> {
    const response = await httpClient.get<string[]>("/movie/categories-data");
    return response;
  }
  async getUniversities(): Promise<ApiResponse<string[]>> {
    const response = await httpClient.get<string[]>("/movie/universities-data");
    return response;
  }
  async getAgeRatings(): Promise<ApiResponse<string[]>> {
    const response = await httpClient.get<string[]>("/movie/ratings-data");
    return response;
  }
  async addRating(data: RatingInput): Promise<ApiResponse<void>> {
    const response = await httpClient.post<void>("/movie/ratings", data);
    return response;
  }
  async checkRating(data: RatingCheckInput): Promise<ApiResponse<boolean>> {
    const response = await httpClient.get<boolean>("/movie/ratings/check", {
      params: data,
    });
    return response;
  }
  async deleteRating(data: RatingCheckInput): Promise<ApiResponse<void>> {
    const response = await httpClient.delete<void>("/movie/ratings", { data });
    return response;
  }
  async updateRating(data: RatingInput): Promise<ApiResponse<void>> {
    const response = await httpClient.put<void>("/movie/ratings", data);
    return response;
  }
  async getRatingByMovieAndUser(
    data: RatingCheckInput,
  ): Promise<ApiResponse<Rating[]>> {
    const response = await httpClient.get<Rating[]>(`/movie/ratings`, {
      params: data,
    });
    return response;
  }
  async getMovieByUniversity(university: string): Promise<ApiResponse<Movie[]>> {
    const response = await httpClient.get<Movie[]>(`/movie/university/${university}`);
    return response;
  }
}
