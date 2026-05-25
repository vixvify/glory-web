"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import { Movie, CreateMovie, UpdateMovie } from "@/core/domain/movie";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CategoryIcon from "@mui/icons-material/Category";
import MovieIcon from "@mui/icons-material/Movie";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { parseSchema } from "@/lib/validation";
import { createMovieSchema } from "@/core/schema/movie";
import { movieService, authService } from "@/infra/container";
import { useAppStore } from "@/store/useStore";
import Loading from "../loading";

type MovieForm = {
  title: string;
  description: string;
  category: string;
  thumbnail?: File | null;
  youtubeUrl: string;
  year: number;
  matchRate: number;
  ageRating: string;
  duration: number;
};

type Sortby = "title" | "year" | "views"

export default function AdminPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<Sortby>("title");
  const { currentUser, setCurrentUser, fetchCurrentUser } = useAppStore();

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableAgeRatings, setAvailableAgeRatings] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<UpdateMovie | null>(null);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [deleteMovieId, setDeleteMovieId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MovieForm>();

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      const list = await movieService.getAllMovies();
      setMovies(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [cats, ratings] = await Promise.all([
        movieService.getCategories(),
        movieService.getAgeRatings()
      ]);
      setAvailableCategories(cats);
      setAvailableAgeRatings(ratings);
    } catch (err) {
      console.error("Failed to load categories or ratings metadata:", err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    loadMovies();
    loadMetadata();
  }, []);

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setSelectedFileName(null);
    reset({
      title: "",
      description: "",
      category: "Action",
      thumbnail: null,
      youtubeUrl: "",
      year: new Date().getFullYear(),
      matchRate: 98,
      ageRating: "PG",
      duration: 120,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setEditingMovieId(movie.id);
    setSelectedFileName(null);
    reset({
      title: movie.title,
      description: movie.description,
      category: movie.category,
      thumbnail: null,
      youtubeUrl: movie.youtubeUrl,
      year: movie.year,
      matchRate: movie.matchRate,
      ageRating: movie.ageRating,
      duration: movie.duration,
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (data: MovieForm) => {
    try {
      const validated = parseSchema(createMovieSchema, {
        ...data,
        thumbnail: data.thumbnail || editingMovie?.thumbnail,
        year: Number(data.year),
        matchRate: Number(data.matchRate),
      });

      if (editingMovie) {
        const updatedMovie: UpdateMovie = {
          ...editingMovie,
          title: validated.title,
          description: validated.description,
          category: validated.category,
          thumbnail: validated.thumbnail,
          youtubeUrl: validated.youtubeUrl,
          year: validated.year,
          matchRate: validated.matchRate,
          ageRating: validated.ageRating,
          duration: validated.duration,
        };
        await movieService.updateMovie(editingMovieId!, updatedMovie);
      } else {
        const newMoviePayload: CreateMovie = {
          title: validated.title,
          description: validated.description,
          category: validated.category,
          thumbnail: validated.thumbnail,
          youtubeUrl: validated.youtubeUrl,
          year: validated.year,
          matchRate: validated.matchRate,
          ageRating: validated.ageRating,
          duration: validated.duration,
        };
        await movieService.createMovie(newMoviePayload);
      }
      await loadMovies();
      setIsFormOpen(false);
      setEditingMovie(null);
      reset();
    } catch (err: any) {
      console.error(err)
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteMovieId) {
      try {
        await movieService.deleteMovie(deleteMovieId);
        await loadMovies();
      } catch (err: any) {
        alert(err.message || "Failed to delete movie");
      }
      setDeleteMovieId(null);
    }
  };

  const totalViews = movies.reduce((sum, m) => sum + (m.views || 0), 0);
  const categories = Array.from(new Set(movies.map((m) => m.category)));

  const getFilteredAndSortedMovies = () => {
    let list = [...movies];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "") {
      list = list.filter((m) => m.category === categoryFilter);
    }

    list.sort((a, b) => {
      if (sortBy === "year") {
        return b.year - a.year;
      }
      if (sortBy === "views") {
        return (b.views || 0) - (a.views || 0);
      }
      return a.title.localeCompare(b.title);
    });

    return list;
  };

  const filteredMovies = getFilteredAndSortedMovies();

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans select-none pb-20">
      <Navbar
        searchQuery=""
        onSearchChange={() => { }}
        selectedCategory={null}
        onCategoryChange={() => { }}
        showMyListOnly={false}
        onMyListOnlyChange={() => { }}
        currentUser={currentUser}
        onSignOut={async () => {
          try {
            await authService.logout();
          } catch (err) {
            console.error(err);
          }
          setCurrentUser(null);
        }}
        onSignInClick={() => { }}
      />

      <main className="flex-1 px-6 md:px-16 pt-28 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Link href="/" className="hover:text-brand transition-colors flex items-center gap-1">
                <ArrowBackIcon className="text-sm" /> Back to Home
              </Link>
              <span>/</span>
              <span className="text-zinc-300">Admin Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Admin Workspace
            </h1>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-hover active:scale-95 transition-all shadow-lg shadow-brand/20 cursor-pointer"
          >
            <AddIcon className="text-lg" />
            Add New Movie
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card border border-zinc-800/40 p-5 rounded-2xl flex items-center gap-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-brand/35 hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <MovieIcon className="text-2xl" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Total Titles</p>
              <h3 className="text-2xl font-black">{movies.length}</h3>
            </div>
          </div>

          <div className="bg-card border border-zinc-800/40 p-5 rounded-2xl flex items-center gap-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-brand/35 hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CategoryIcon className="text-2xl" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Categories</p>
              <h3 className="text-2xl font-black">{categories.length}</h3>
            </div>
          </div>

          <div className="bg-card border border-zinc-800/40 p-5 rounded-2xl flex items-center gap-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-brand/35 hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <VisibilityIcon className="text-2xl" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Total Views</p>
              <h3 className="text-2xl font-black">{totalViews.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-zinc-800/35 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
          <div className="p-5 border-b border-zinc-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <SearchIcon className="text-lg" />
              </span>
              <input
                type="text"
                placeholder="Search catalog by title, genre, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-black/40 border border-zinc-800 focus:border-brand focus:outline-none rounded-xl text-white placeholder-zinc-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors"
                >
                  <CloseIcon className="text-base" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-semibold whitespace-nowrap">Filter:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-1.5 focus:border-brand focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-zinc-900 text-white">All Categories</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-zinc-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-semibold whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as Sortby)}
                  className="text-xs bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-1.5 focus:border-brand focus:outline-none cursor-pointer"
                >
                  <option value="title" className="bg-zinc-900 text-white">Alphabetical</option>
                  <option value="year" className="bg-zinc-900 text-white">Release Year</option>
                  <option value="views" className="bg-zinc-900 text-white">Popularity</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/40 text-xs font-bold text-zinc-400 uppercase bg-zinc-950/20">
                  <th className="py-4 px-6">Movie</th>
                  <th className="py-4 px-6">Genre</th>
                  <th className="py-4 px-6">Release / Rating</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Stats</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30 text-sm">
                {filteredMovies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500 font-light">
                      No movies matching your active filter.
                    </td>
                  </tr>
                ) : (
                  filteredMovies.map((movie) => (
                    <tr
                      key={movie.id}
                      className="group/row hover:bg-zinc-900/10 transition-colors"
                    >
                      <td className="py-4 px-6 flex items-center gap-4">
                        <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-zinc-800/50 shadow-md flex-shrink-0">
                          <img
                            src={movie.thumbnail}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover/row:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-white group-hover/row:text-brand transition-colors">
                            {movie.title}
                          </h4>
                          <p className="text-xs text-zinc-400 max-w-[240px] truncate font-light">
                            {movie.description}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand/10 text-brand border border-brand/20">
                          {movie.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-semibold">
                          <CalendarTodayIcon className="text-[10px] text-zinc-500" />
                          {movie.year}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 text-[10px] font-bold border border-zinc-700 text-zinc-400 rounded leading-none">
                            {movie.ageRating}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">{movie.matchRate}% Match</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-zinc-300 font-medium">
                        <div className="flex items-center gap-1">
                          <AccessTimeIcon className="text-xs text-zinc-500" />
                          {movie.duration}
                        </div>
                      </td>

                      <td className="py-4 px-6 space-y-1">
                        <div className="text-xs text-zinc-300 flex items-center gap-1">
                          <VisibilityIcon className="text-xs text-zinc-500" />
                          {(movie.views || 0).toLocaleString()} views
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <StarIcon className="text-[10px] text-zinc-500" />
                          {movie.ratings?.length || 0} reviews
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(movie)}
                            className="p-2 rounded-lg bg-zinc-800/80 hover:bg-brand/20 text-zinc-400 hover:text-brand border border-zinc-800 hover:border-brand/30 transition-all cursor-pointer"
                          >
                            <EditIcon className="text-sm" />
                          </button>
                          <button
                            onClick={() => setDeleteMovieId(movie.id)}
                            className="p-2 rounded-lg bg-zinc-800/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 transition-all cursor-pointer"
                          >
                            <DeleteIcon className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end animate-fade-in bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full bg-card border-l border-zinc-800/40 p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-y-auto animate-slide-left">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <CloseIcon />
            </button>

            <div className="space-y-6 flex-1 pr-1.5">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  {editingMovie ? "Edit Film Details" : "Publish New Film"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-light">
                  Provide correct information to catalog this film successfully.
                </p>
              </div>

              <form id="movie-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Interstellar"
                    {...register("title", { required: "Title is required" })}
                    className={`w-full bg-black/40 border ${errors.title ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-brand"
                      } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors`}
                  />
                  {errors.title && (
                    <span className="text-[10px] text-red-500 block pl-1 font-semibold">{errors.title.message}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Category</label>
                    <select
                      {...register("category", { required: "Category is required" })}
                      className="w-full bg-black/40 border border-zinc-800 focus:border-brand rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors cursor-pointer"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat} className="bg-zinc-900 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Age Rating</label>
                    <select
                      {...register("ageRating", { required: "Age rating is required" })}
                      className="w-full bg-black/40 border border-zinc-800 focus:border-brand rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors cursor-pointer"
                    >
                      {availableAgeRatings.map((rating) => (
                        <option key={rating} value={rating} className="bg-zinc-900 text-white">
                          {rating}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Year</label>
                    <input
                      type="number"
                      placeholder="e.g. 2024"
                      {...register("year", {
                        required: "Year is required",
                        min: { value: 1900, message: "Invalid year" },
                        max: { value: 2100, message: "Invalid year" },
                      })}
                      className={`w-full bg-black/40 border ${errors.year ? "border-red-500" : "border-zinc-800"
                        } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors`}
                    />
                    {errors.year && (
                      <span className="text-[10px] text-red-500 block pl-1 font-semibold">{errors.year.message}</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Match %</label>
                    <input
                      type="number"
                      placeholder="98"
                      {...register("matchRate", {
                        required: "Match rate is required",
                        min: { value: 0, message: "Min 0%" },
                        max: { value: 100, message: "Max 100%" },
                      })}
                      className={`w-full bg-black/40 border ${errors.matchRate ? "border-red-500" : "border-zinc-800"
                        } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors`}
                    />
                    {errors.matchRate && (
                      <span className="text-[10px] text-red-500 block pl-1 font-semibold">{errors.matchRate.message}</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 2h 10m"
                      {...register("duration", { required: "Duration is required" })}
                      className={`w-full bg-black/40 border ${errors.duration ? "border-red-500" : "border-zinc-800"
                        } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors`}
                    />
                    {errors.duration && (
                      <span className="text-[10px] text-red-500 block pl-1 font-semibold">{errors.duration.message}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Cover Image</label>
                  <div className="relative group/file">
                    <input
                      type="file"
                      accept="image/*"
                      {...register("thumbnail", {
                        required: editingMovie ? false : "Cover image is required",
                        onChange: (e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            setSelectedFileName(files[0].name);
                          } else {
                            setSelectedFileName(null);
                          }
                        }
                      })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full bg-black/40 border ${errors.thumbnail ? "border-red-500" : "border-zinc-800 group-hover/file:border-brand"
                      } rounded-xl px-4 py-3 text-sm text-zinc-400 flex items-center justify-between transition-colors`}>
                      <span className={selectedFileName ? "text-white font-medium truncate max-w-[70%]" : "text-zinc-400"}>
                        {selectedFileName || "Upload cover image file..."}
                      </span>
                      <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold group-hover/file:bg-brand group-hover/file:text-white transition-colors">
                        Browse
                      </span>
                    </div>
                  </div>
                  {errors.thumbnail && (
                    <span className="text-[10px] text-red-500 block pl-1 font-semibold">{errors.thumbnail.message}</span>
                  )}
                  {editingMovie && typeof editingMovie.thumbnail === "string" && (
                    <p className="text-[10px] text-zinc-500 pl-1 leading-relaxed">
                      Current: <span className="text-brand font-medium truncate max-w-[200px] inline-block align-bottom">{editingMovie.thumbnail.split("/").pop()}</span> (Leave blank to keep existing)
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">YouTube Trailer URL</label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register("youtubeUrl", { required: "YouTube URL is required" })}
                    className={`w-full bg-black/40 border ${errors.youtubeUrl ? "border-red-500" : "border-zinc-800"
                      } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors`}
                  />
                  {errors.youtubeUrl && (
                    <span className="text-[10px] text-red-500 block pl-1 font-semibold">{errors.youtubeUrl.message}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Enter short storyline..."
                    {...register("description", { required: "Description is required" })}
                    className={`w-full bg-black/40 border ${errors.description ? "border-red-500" : "border-zinc-800"
                      } rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand transition-colors resize-none`}
                  />
                  {errors.description && (
                    <span className="text-[10px] text-red-500 block pl-1 font-semibold">{errors.description.message}</span>
                  )}
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-zinc-800/40 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-3 text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="movie-form"
                className="flex-1 py-3 text-sm font-semibold bg-brand hover:bg-brand-hover text-white rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-brand/20 cursor-pointer"
              >
                {editingMovie ? "Save Changes" : "Publish Film"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteMovieId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-zinc-800/60 p-6 md:p-8 rounded-2xl max-w-sm w-full text-center space-y-6 shadow-2xl relative animate-scale-up">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl">
              <DeleteIcon />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Permanently Delete Film?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                This action is permanent. The selected title will be purged immediately from the library catalog.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteMovieId(null)}
                className="flex-1 py-2.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-red-500/20 cursor-pointer"
              >
                Delete Title
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
