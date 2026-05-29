"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "@/components/ui/navbar";
import MovieHero from "@/components/movie/movie-hero";
import MovieGrid from "@/components/movie/movie-grid";
import MovieRow from "@/components/movie/movie-row";
import MovieRankRow from "@/components/movie/movie-rank-row";
import MovieDetailsModal from "@/components/movie/movie-details-modal";
import TrailerModal from "@/components/modal/trailer-modal";
import AuthModal from "@/components/modal/auth-modal";
import { Movie } from "@/core/domain/movie";
import { User } from "@/core/domain/user";
import { useAppStore } from "@/store/use-store";
import Loading from "./loading";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { CATEGORY_TITLE_MAPPING } from "@/core/constants/categories";
import { useMoviesQuery } from "@/hooks/use-movies";
import { useFavoritesQuery, useToggleFavoriteMutation } from "@/hooks/use-favorites";
import {
  useMovieUserRatingQuery,
  useAddRatingMutation,
  useUpdateRatingMutation,
  useDeleteRatingMutation,
} from "@/hooks/use-ratings";
import { useCategoriesQuery, useUniversitiesQuery } from "@/hooks/use-master-data";
import { useLogoutMutation } from "@/hooks/use-auth";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMyListOnly, setShowMyListOnly] = useState(false);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { currentUser, setCurrentUser, showToast } = useAppStore();

  const { data: allMovies = [], isLoading: isMoviesLoading } = useMoviesQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: universities = [] } = useUniversitiesQuery();
  const { data: serverFavorites } = useFavoritesQuery(!!currentUser);

  const [localFavorites, setLocalFavorites] = useState<Movie[] | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLocalFavorites(null);
      setShowMyListOnly(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (serverFavorites) {
      setLocalFavorites(null);
    }
  }, [serverFavorites]);

  const favorites = localFavorites ?? serverFavorites ?? [];

  const { data: userRatings = [] } = useMovieUserRatingQuery(
    selectedMovie?.id || "",
    currentUser?.id || "",
    !!selectedMovie && !!currentUser
  );
  const currentUserRating = userRatings.length > 0 ? userRatings[0] : null;

  const toggleFavoriteMutation = useToggleFavoriteMutation();
  const addRatingMutation = useAddRatingMutation();
  const updateRatingMutation = useUpdateRatingMutation();
  const deleteRatingMutation = useDeleteRatingMutation();
  const logoutMutation = useLogoutMutation();

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
  }, [setCurrentUser]);

  const handleSignOut = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const handleToggleFavorite = useCallback((movieId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const isCurrentlyFavorite = favorites.some((m) => m.id === movieId);
    const previousFavorites = [...favorites];

    const targetMovie = allMovies.find((m) => m.id === movieId);
    const updatedFavorites = isCurrentlyFavorite
      ? favorites.filter((m) => m.id !== movieId)
      : targetMovie
        ? [...favorites, targetMovie]
        : favorites;

    setLocalFavorites(updatedFavorites);

    toggleFavoriteMutation.mutate(
      { movieId, isFavorite: isCurrentlyFavorite },
      {
        onSuccess: () => {
          if (isCurrentlyFavorite) {
            showToast("นำออกจากรายการโปรดแล้ว", "info");
          } else {
            showToast("เพิ่มลงในรายการโปรดแล้ว", "success");
          }
        },
        onError: () => {
          setLocalFavorites(previousFavorites);
          showToast("เกิดข้อผิดพลาดในการปรับปรุงรายการโปรด", "error");
        },
      }
    );
  }, [currentUser, favorites, allMovies, toggleFavoriteMutation, showToast]);

  const handleAddRating = useCallback((movieId: string, user: User, stars: number) => {
    addRatingMutation.mutate(
      { userId: user.id, movieId, stars },
      {
        onSuccess: () => {
          showToast("เพิ่มคะแนนแล้ว", "success");
        },
        onError: () => {
          showToast("เกิดข้อผิดพลาด", "error");
        },
      }
    );
  }, [addRatingMutation, showToast]);

  const handleUpdateRating = useCallback((movieId: string, user: User, stars: number) => {
    updateRatingMutation.mutate(
      { userId: user.id, movieId, stars },
      {
        onSuccess: () => {
          showToast("แก้ไขคะแนนแล้ว", "success");
        },
        onError: () => {
          showToast("เกิดข้อผิดพลาด", "error");
        },
      }
    );
  }, [updateRatingMutation, showToast]);

  const handleDeleteRating = useCallback((movieId: string, user: User) => {
    deleteRatingMutation.mutate(
      { userId: user.id, movieId },
      {
        onSuccess: () => {
          showToast("ลบคะแนนแล้ว", "success");
        },
        onError: () => {
          showToast("เกิดข้อผิดพลาด", "error");
        },
      }
    );
  }, [deleteRatingMutation, showToast]);

  const handlePlayTrailer = useCallback((movie: Movie) => {
    setTrailerMovie(movie);
    setIsPlayingTrailer(true);
  }, []);

  const activeMovieForModal = useMemo(() => {
    if (!selectedMovie) return null;
    return allMovies.find((m) => m.id === selectedMovie.id) || selectedMovie;
  }, [selectedMovie, allMovies]);

  const filteredMovies = useMemo(() => {
    let list = allMovies;

    if (showMyListOnly) {
      list = favorites;
    } else if (selectedCategory) {
      list = list.filter((m) => m.category === selectedCategory);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allMovies, showMyListOnly, favorites, selectedCategory, searchQuery]);

  const isBrowsingRowView = !searchQuery && !selectedCategory && !showMyListOnly;

  const recommendedMovies = useMemo(() => {
    return [...allMovies].sort((a, b) => b.matchRate - a.matchRate).slice(0, 5);
  }, [allMovies]);

  const popularMovies = useMemo(() => {
    return [...allMovies].sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [allMovies]);

  const moviesByUniversity = useMemo(() => {
    const map: Record<string, Movie[]> = {};
    for (const movie of allMovies) {
      if (movie.university) {
        if (!map[movie.university]) {
          map[movie.university] = [];
        }
        map[movie.university].push(movie);
      }
    }
    return map;
  }, [allMovies]);

  const moviesByCategory = useMemo(() => {
    const map: Record<string, Movie[]> = {};
    for (const movie of allMovies) {
      if (movie.category) {
        if (!map[movie.category]) {
          map[movie.category] = [];
        }
        map[movie.category].push(movie);
      }
    }
    return map;
  }, [allMovies]);

  if (isMoviesLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans select-none pb-16 transition-colors duration-450">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        showMyListOnly={showMyListOnly}
        onMyListOnlyChange={setShowMyListOnly}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onSignInClick={() => setIsAuthOpen(true)}
        categories={categories}
      />

      {isBrowsingRowView ? (
        <main className="flex-1 flex flex-col">
          <MovieHero
            movies={recommendedMovies}
            onPlayClick={handlePlayTrailer}
            onInfoClick={setSelectedMovie}
          />

          <div className="relative z-20 px-6 md:px-16 space-y-12 -mt-6 md:-mt-10">
            <MovieRankRow
              title="10 อันดับหนังยอดนิยม"
              movies={popularMovies}
              onMovieClick={setSelectedMovie}
              onPlayClick={handlePlayTrailer}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />

            {favorites.length > 0 && (
              <MovieRow
                title="รายการโปรดของคุณ"
                movies={favorites}
                onMovieClick={setSelectedMovie}
                onPlayClick={handlePlayTrailer}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {universities.map((uni) => {
              const uniMovies = moviesByUniversity[uni.name] || [];
              if (uniMovies.length === 0) return null;

              return (
                <MovieRow
                  key={uni.id}
                  title={`ผลงานภาพยนตร์จาก ${uni.name}`}
                  movies={uniMovies}
                  onMovieClick={setSelectedMovie}
                  onPlayClick={handlePlayTrailer}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })}

            {categories.map((category) => {
              const categoryMovies = moviesByCategory[category.name] || [];
              if (categoryMovies.length === 0) return null;

              const displayTitle = CATEGORY_TITLE_MAPPING[category.name];

              return (
                <MovieRow
                  key={category.id}
                  title={displayTitle}
                  movies={categoryMovies}
                  onMovieClick={setSelectedMovie}
                  onPlayClick={handlePlayTrailer}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })}
          </div>
        </main>
      ) : (
        <main className="flex-1 px-6 md:px-16 pt-28 space-y-8 animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide">
              {searchQuery
                ? `ผลลัพธ์การค้นหา "${searchQuery}"`
                : showMyListOnly
                  ? "รายการของฉัน"
                  : `${CATEGORY_TITLE_MAPPING[selectedCategory || ""]}`}
            </h2>
            <span className="text-sm text-zinc-400">
              {filteredMovies.length} เรื่อง
            </span>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <p className="text-lg text-zinc-400 font-light">
                ไม่พบผลลัพธ์ที่ตรงกัน
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setShowMyListOnly(false);
                }}
              >
                ล้างตัวกรอง
              </Button>
            </div>
          ) : (
            <MovieGrid
              movies={filteredMovies}
              onMovieClick={setSelectedMovie}
              onPlayClick={handlePlayTrailer}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </main>
      )}

      {activeMovieForModal && (
        <MovieDetailsModal
          isOpen={!!selectedMovie}
          onClose={() => setSelectedMovie(null)}
          movie={activeMovieForModal}
          isFavorite={favorites.some((fav) => fav.id === activeMovieForModal.id)}
          onToggleFavorite={handleToggleFavorite}
          onPlayTrailer={() => handlePlayTrailer(activeMovieForModal)}
          onAddRating={handleAddRating}
          onUpdateRating={handleUpdateRating}
          onDeleteRating={handleDeleteRating}
          userRating={currentUserRating}
          currentUser={currentUser}
          onSignInClick={() => setIsAuthOpen(true)}
        />
      )}

      {trailerMovie && (
        <TrailerModal
          isOpen={isPlayingTrailer}
          onClose={() => setIsPlayingTrailer(false)}
          youtubeUrl={trailerMovie.youtubeUrl}
          movieTitle={trailerMovie.title}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <Toast />
    </div>
  );
}
