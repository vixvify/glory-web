import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { movieService } from "@/infra/container";
import { Movie, CreateMovie, UpdateMovie } from "@/core/domain/movie";
import { RatingInput, RatingCheckInput, Rating } from "@/core/domain/rating";

export function useMoviesQuery() {
  return useQuery<Movie[], Error>({
    queryKey: ["movies"],
    queryFn: () => movieService.getAllMovies(),
  });
}

export function useCategoriesQuery() {
  return useQuery<string[], Error>({
    queryKey: ["categories"],
    queryFn: () => movieService.getCategories(),
  });
}

export function useUniversitiesQuery() {
  return useQuery<string[], Error>({
    queryKey: ["universities"],
    queryFn: () => movieService.getUniversities(),
  });
}

export function useFavoritesQuery(enabled = true) {
  return useQuery<Movie[], Error>({
    queryKey: ["favorites"],
    queryFn: () => movieService.getFavorites(),
    enabled,
  });
}

export function useMovieUserRatingQuery(movieId: string, userId: string, enabled = true) {
  return useQuery<Rating[], Error>({
    queryKey: ["movie-rating", movieId, userId],
    queryFn: () => movieService.getRatingByMovieAndUser({ movieId, userId }),
    enabled: enabled && !!movieId && !!userId,
  });
}

export function useAgeRatingsQuery() {
  return useQuery<string[], Error>({
    queryKey: ["ageRatings"],
    queryFn: () => movieService.getAgeRatings(),
  });
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { movieId: string; isFavorite: boolean }>({
    mutationFn: ({ movieId, isFavorite }) =>
      isFavorite
        ? movieService.removeFavorite(movieId)
        : movieService.addFavorite(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}

export function useAddRatingMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, RatingInput>({
    mutationFn: (data) => movieService.addRating(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({
        queryKey: ["movie-rating", variables.movieId, variables.userId],
      });
    },
  });
}

export function useUpdateRatingMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, RatingInput>({
    mutationFn: (data) => movieService.updateRating(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({
        queryKey: ["movie-rating", variables.movieId, variables.userId],
      });
    },
  });
}

export function useDeleteRatingMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, RatingCheckInput>({
    mutationFn: (data) => movieService.deleteRating(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({
        queryKey: ["movie-rating", variables.movieId, variables.userId],
      });
    },
  });
}

export function useCreateMovieMutation() {
  const queryClient = useQueryClient();
  return useMutation<Movie, Error, CreateMovie>({
    mutationFn: (movie) => movieService.createMovie(movie),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateMovieMutation() {
  const queryClient = useQueryClient();
  return useMutation<Movie, Error, { id: string; movie: UpdateMovie }>({
    mutationFn: ({ id, movie }) => movieService.updateMovie(id, movie),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}

export function useDeleteMovieMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => movieService.deleteMovie(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}

export function useMovieByUniversityQuery(university: string) {
  return useQuery<Movie[], Error>({
    queryKey: ["movies-university", university],
    queryFn: () => movieService.getMoviesByUniversity(university),
  });
}
