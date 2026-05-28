import { ApiResponse } from "@/infra/interface/response";
import { Movie } from "../domain/movie";
import { Rating, RatingCheckInput, RatingInput } from "../domain/rating";

export interface MovieRepository {
  getAllMovies(): Promise<ApiResponse<Movie[]>>;
  getMovieById(id: string): Promise<ApiResponse<Movie>>;
  searchMovies(query: string): Promise<ApiResponse<Movie[]>>;
  getMoviesByCategory(category: string): Promise<ApiResponse<Movie[]>>;
  getMoviesByUniversity(university: string): Promise<ApiResponse<Movie[]>>;
  createMovie(formData: FormData): Promise<ApiResponse<Movie>>;
  updateMovie(id: string, formData: FormData): Promise<ApiResponse<Movie>>;
  deleteMovie(id: string): Promise<ApiResponse<void>>;
  getFavorites(): Promise<ApiResponse<Movie[]>>;
  addFavorite(movieId: string): Promise<ApiResponse<void>>;
  removeFavorite(movieId: string): Promise<ApiResponse<void>>;
  getCategories(): Promise<ApiResponse<string[]>>;
  getAgeRatings(): Promise<ApiResponse<string[]>>;
  getUniversities(): Promise<ApiResponse<string[]>>;
  addRating(data: RatingInput): Promise<ApiResponse<void>>;
  checkRating(data: RatingCheckInput): Promise<ApiResponse<boolean>>;
  deleteRating(data: RatingCheckInput): Promise<ApiResponse<void>>;
  updateRating(data: RatingInput): Promise<ApiResponse<void>>;
  getRatingByMovieAndUser(
    data: RatingCheckInput,
  ): Promise<ApiResponse<Rating[]>>;
}
