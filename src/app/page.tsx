"use client";

import { useState } from "react";
import Navbar from "@/components/ui/navbar";
import MovieHero from "@/components/movie/movie-hero";
import MovieGrid from "@/components/movie/movie-grid";
import MovieRow from "@/components/movie/movie-row";
import MovieDetailsModal from "@/components/movie/movie-details-modal";
import TrailerModal from "@/components/modal/trailer-modal";
import AuthModal from "@/components/modal/auth-modal";
import { Movie } from "@/core/domain/movie";
import { User } from "@/core/domain/user";
import { useAppStore } from "@/store/use-store";
import Loading from "./loading";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { categoryTitleMapping } from "@/core/constants/categories";
import {
  useMoviesQuery,
  useCategoriesQuery,
  useFavoritesQuery,
  useToggleFavoriteMutation,
  useAddRatingMutation,
  useUpdateRatingMutation,
  useDeleteRatingMutation,
} from "@/hooks/use-movies";
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
  const { data: favorites = [] } = useFavoritesQuery(!!currentUser);

  const toggleFavoriteMutation = useToggleFavoriteMutation();
  const addRatingMutation = useAddRatingMutation();
  const updateRatingMutation = useUpdateRatingMutation();
  const deleteRatingMutation = useDeleteRatingMutation();
  const logoutMutation = useLogoutMutation();

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  const handleToggleFavorite = (movieId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const isCurrentlyFavorite = favorites.includes(movieId);

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
          showToast("เกิดข้อผิดพลาดในการปรับปรุงรายการโปรด", "error");
        },
      }
    );
  };

  const handleAddRating = (movieId: string, user: User, stars: number) => {
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
  };

  const handleUpdateRating = (movieId: string, user: User, stars: number) => {
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
  };

  const handleDeleteRating = (movieId: string, user: User) => {
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
  };

  const handlePlayTrailer = (movie: Movie) => {
    setTrailerMovie(movie);
    setIsPlayingTrailer(true);
  };

  const activeMovieForModal = selectedMovie
    ? allMovies.find((m) => m.id === selectedMovie.id) || selectedMovie
    : null;

  const getFilteredMovies = () => {
    let list = allMovies;

    if (showMyListOnly) {
      list = list.filter((m) => favorites.includes(m.id));
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
  };

  const filteredMovies = getFilteredMovies();
  const isBrowsingRowView = !searchQuery && !selectedCategory && !showMyListOnly;

  const recommendedMovies = () => {
    return [...allMovies].sort((a, b) => b.matchRate - a.matchRate).slice(0, 5);
  };

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
            movies={recommendedMovies()}
            onPlayClick={handlePlayTrailer}
            onInfoClick={setSelectedMovie}
          />

          <div className="relative z-20 px-6 md:px-16 space-y-12 -mt-6 md:-mt-10">
            <MovieRow
              title="ยอดนิยม"
              movies={allMovies}
              onMovieClick={setSelectedMovie}
              onPlayClick={handlePlayTrailer}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />

            {categories.map((category) => {
              const categoryMovies = allMovies.filter((m) => m.category === category);
              if (categoryMovies.length === 0) return null;

              const displayTitle = categoryTitleMapping[category] || category;

              return (
                <MovieRow
                  key={category}
                  title={displayTitle}
                  movies={categoryMovies}
                  onMovieClick={setSelectedMovie}
                  onPlayClick={handlePlayTrailer}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })}

            {allMovies.filter((m) => favorites.includes(m.id)).length > 0 && (
              <MovieRow
                title="รายการของฉัน"
                movies={allMovies.filter((m) => favorites.includes(m.id))}
                onMovieClick={setSelectedMovie}
                onPlayClick={handlePlayTrailer}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
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
                  : `${selectedCategory} หนัง`}
            </h2>
            <span className="text-sm text-zinc-400">
              {filteredMovies.length} เรื่อง ที่พบ
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
          isFavorite={favorites.includes(activeMovieForModal.id)}
          onToggleFavorite={handleToggleFavorite}
          onPlayTrailer={() => handlePlayTrailer(activeMovieForModal)}
          onAddRating={handleAddRating}
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
