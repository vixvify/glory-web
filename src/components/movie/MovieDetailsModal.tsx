"use client";

import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Movie } from "@/core/domain/movie";

interface MovieDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
  isFavorite: boolean;
  onToggleFavorite: (movieId: string) => void;
  onPlayTrailer: () => void;
  onAddRating: (movieId: string, user: string, score: number) => void;
  currentUser: { name: string; email: string } | null;
  onSignInClick: () => void;
}

export default function MovieDetailsModal({
  isOpen,
  onClose,
  movie,
  isFavorite,
  onToggleFavorite,
  onPlayTrailer,
  onAddRating,
  currentUser,
  onSignInClick,
}: MovieDetailsModalProps) {
  const [reviewScore, setReviewScore] = useState(5);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsSubmitted(false);
      setReviewScore(5);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalScore = movie.ratings.reduce((sum, r) => sum + r.score, 0);
  const averageRating = movie.ratings.length > 0 ? totalScore / movie.ratings.length : 0;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    onAddRating(movie.id, currentUser.name, reviewScore);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-card rounded-2xl overflow-y-auto max-h-[90vh] shadow-2xl border border-zinc-800/80 animate-scale-up z-10 no-scrollbar">
        <div
          className="relative h-64 md:h-96 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to top, var(--theme-bg), rgba(var(--theme-bg-rgb), 0.4) 40%, rgba(var(--theme-bg-rgb), 0.7)), url(${movie.thumbnail})`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-zinc-700/50"
          >
            <CloseIcon className="text-xl" />
          </button>

          <div className="absolute bottom-6 left-6 md:left-12 flex flex-wrap items-end gap-4 z-10 w-[90%]">
            <div>
              <div className="text-sm font-semibold tracking-wider text-brand mb-1">
                THAIFLIX ORIGINAL
              </div>
              <h2 className="text-2xl md:text-5xl font-extrabold text-white tracking-wide drop-shadow-md mb-4">
                {movie.title}
              </h2>
              
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={onPlayTrailer}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-white/85 active:scale-95 transition-all cursor-pointer shadow-lg"
                >
                  <PlayArrowIcon className="text-xl" />
                  Play Trailer
                </button>

                <button
                  onClick={() => onToggleFavorite(movie.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all cursor-pointer ${
                    isFavorite
                      ? "bg-zinc-800 border-zinc-400 text-emerald-400 hover:border-white"
                      : "bg-[#181818]/60 border-zinc-500 text-white hover:border-white hover:bg-zinc-800"
                  }`}
                  title={isFavorite ? "Remove from My List" : "Add to My List"}
                >
                  {isFavorite ? <CheckIcon className="text-lg" /> : <AddIcon className="text-lg" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-12 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-emerald-400 font-bold tracking-tight">
                {movie.matchRate}% Match
              </span>
              <span className="text-zinc-400">{movie.year}</span>
              <span className="px-1.5 py-0.5 text-xs font-semibold border border-zinc-500 text-zinc-300 rounded">
                {movie.ageRating}
              </span>
              <span className="text-zinc-400">{movie.duration}</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-zinc-850 text-zinc-300 rounded-full">
                {movie.category}
              </span>
            </div>

            <p className="text-zinc-200 text-base md:text-lg leading-relaxed font-light">
              {movie.description}
            </p>

            <div className="h-[1px] bg-zinc-800 w-full" />

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white tracking-wide">
                Audience Reviews ({movie.ratings.length})
              </h4>

              <div className="space-y-3.5 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {movie.ratings.length === 0 ? (
                  <p className="text-zinc-500 text-sm italic">No reviews yet. Be the first to leave one!</p>
                ) : (
                  movie.ratings.map((rating, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3.5"
                    >
                      <AccountCircleIcon className="text-zinc-650 text-3xl mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-semibold text-zinc-200 truncate">
                            {rating.user}
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i}>
                                {i < rating.score ? (
                                  <StarIcon className="text-sm" />
                                ) : (
                                  <StarBorderIcon className="text-sm text-zinc-700" />
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 font-light italic">
                          "Gave it a score of {rating.score}/5 stars."
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 text-center space-y-2 shadow-xl shadow-black/10">
              <span className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">
                Average Rating
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-extrabold text-white">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-lg text-zinc-500">/ 5.0</span>
              </div>
              <div className="flex justify-center text-amber-555">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>
                    {i < Math.round(averageRating) ? (
                      <StarIcon className="text-lg text-amber-500" />
                    ) : (
                      <StarBorderIcon className="text-lg text-zinc-700" />
                    )}
                  </span>
                ))}
              </div>
              <p className="text-xs text-zinc-500 font-light">
                Based on {movie.ratings.length} reviews
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4 shadow-xl">
              <h5 className="text-sm font-bold text-white tracking-wide uppercase">
                Rate this Movie
              </h5>

              {isSubmitted ? (
                <div className="text-center py-4 space-y-2 animate-fade-in">
                  <span className="text-emerald-400 font-semibold text-sm">
                    Thank you!
                  </span>
                  <p className="text-xs text-zinc-400 font-light">
                    Your rating has been recorded.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs text-brand font-medium hover:underline cursor-pointer"
                  >
                    Leave another?
                  </button>
                </div>
              ) : currentUser ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Reviewing as:</span>
                    <span className="text-xs font-bold text-white truncate max-w-[120px] bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                      {currentUser.name}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 font-medium block">Rating Score</label>
                    <div className="flex items-center justify-between px-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const scoreValue = i + 1;
                        return (
                          <button
                            type="button"
                            key={scoreValue}
                            onClick={() => setReviewScore(scoreValue)}
                            className="p-1 text-amber-500 transition-transform duration-200 hover:scale-125 focus:outline-none cursor-pointer"
                          >
                            {scoreValue <= reviewScore ? (
                              <StarIcon className="text-2xl animate-scale-up" />
                            ) : (
                              <StarBorderIcon className="text-2xl text-zinc-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand-hover active:scale-95 transition-all shadow-md shadow-brand/10 cursor-pointer"
                  >
                    Submit Rating
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    You need to be signed in to rate movies and leave reviews.
                  </p>
                  <button
                    onClick={onSignInClick}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-zinc-800 text-white font-semibold text-xs hover:bg-zinc-700 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <LockOpenIcon className="text-sm text-brand" />
                    Sign In to Rate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
