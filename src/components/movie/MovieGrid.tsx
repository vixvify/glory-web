"use client";

import { Movie } from "@/core/domain/movie";
import MovieCard from "@/components/movie/MovieCard";

interface Props {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  onPlayClick: (movie: Movie) => void;
  favorites: string[];
  onToggleFavorite: (movieId: string) => void;
}

export default function MovieGrid({
  movies,
  onMovieClick,
  onPlayClick,
  favorites,
  onToggleFavorite,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onClick={() => onMovieClick(movie)}
          onPlayClick={() => onPlayClick(movie)}
          isFavorite={favorites.includes(movie.id)}
          onToggleFavorite={() => onToggleFavorite(movie.id)}
        />
      ))}
    </div>
  );
}

