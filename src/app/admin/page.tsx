"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/navbar";
import {
  Movie,
  CreateMovie,
  UpdateMovie,
  CrewMember,
} from "@/core/domain/movie";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CategoryIcon from "@mui/icons-material/Category";
import MovieIcon from "@mui/icons-material/Movie";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloseIcon from "@mui/icons-material/Close";
import { useAppStore } from "@/store/use-store";
import Loading from "../loading";
import { Button } from "@/components/ui/button";
import {
  useMoviesQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} from "@/hooks/use-movies";
import {
  useCategoriesQuery,
  useAgeRatingsQuery,
  useUniversitiesQuery,
} from "@/hooks/use-master-data";
import {
  useCrewMembersQuery,
  useCreateCrewMemberMutation,
  useUpdateCrewMemberMutation,
  useDeleteCrewMemberMutation,
} from "@/hooks/use-crew-members";
import { useLogoutMutation } from "@/hooks/use-auth";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import { ConfirmModal } from "@/components/modal/confirm-modal";
import { ImageCropper } from "@/components/modal/image-cropper";
import { LOCALIZATION } from "@/core/constants/localization";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { MovieFormSidebar } from "@/components/ui/movie-form-sidebar";

type ValidatedMoviePayload = {
  title: string;
  description: string;
  category: string;
  thumbnail: File | string | null;
  youtubeUrl: string;
  year: number;
  matchRate: number;
  ageRating: string;
  duration: number;
  university?: string;
  director?: string[];
  producer?: string[];
  writer?: string[];
  cast?: string[];
  btsVideo?: string;
  btsPhotos?: (File | string)[];
};

type Sortby = "title" | "year" | "views";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"movies" | "crew">("movies");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<Sortby>("title");
  const { currentUser, showToast } = useAppStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [deleteMovieId, setDeleteMovieId] = useState<string | null>(null);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);

  const [crewSearchQuery, setCrewSearchQuery] = useState("");
  const [isCrewFormOpen, setIsCrewFormOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);
  const [deleteCrewId, setDeleteCrewId] = useState<string | null>(null);
  const [crewNameInput, setCrewNameInput] = useState("");
  const [crewPhotoInput, setCrewPhotoInput] = useState<File | null>(null);
  const [crewPhotoName, setCrewPhotoName] = useState<string | null>(null);

  const [crewPhotoPreview, setCrewPhotoPreview] = useState<string | null>(null);
  const [rawCrewFile, setRawCrewFile] = useState<File | null>(null);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const [isConfirmMovieOpen, setIsConfirmMovieOpen] = useState(false);
  const [movieFormPendingData, setMovieFormPendingData] =
    useState<ValidatedMoviePayload | null>(null);
  const [isConfirmCrewOpen, setIsConfirmCrewOpen] = useState(false);

  useEffect(() => {
    if (!isFormOpen) {
      setMovieFormPendingData(null);
    }
  }, [isFormOpen]);

  useEffect(() => {
    if (!isCrewFormOpen) {
      setCrewPhotoPreview(null);
      setRawCrewFile(null);
    }
  }, [isCrewFormOpen]);

  const { data: movies = [], isLoading: isMoviesLoading } = useMoviesQuery();
  const { data: availableCategories = [] } = useCategoriesQuery();
  const { data: availableAgeRatings = [] } = useAgeRatingsQuery();
  const { data: availableUniversities = [] } = useUniversitiesQuery();
  const { data: availableCrew = [] } = useCrewMembersQuery();

  const crewOptions = availableCrew.map((c) => ({
    id: c.id,
    name: c.name,
    photoUrl: c.photoUrl,
  }));

  const createMovieMutation = useCreateMovieMutation();
  const updateMovieMutation = useUpdateMovieMutation();
  const deleteMovieMutation = useDeleteMovieMutation();
  const createCrewMutation = useCreateCrewMemberMutation();
  const updateCrewMutation = useUpdateCrewMemberMutation();
  const deleteCrewMutation = useDeleteCrewMemberMutation();
  const logoutMutation = useLogoutMutation();

  const isSaving =
    createMovieMutation.isPending ||
    updateMovieMutation.isPending ||
    createCrewMutation.isPending ||
    updateCrewMutation.isPending ||
    isSavingLocal;
  const isDeleting =
    deleteMovieMutation.isPending ||
    deleteCrewMutation.isPending ||
    isDeletingLocal;
  const isMutating = isSaving || isDeleting;

  const isCrewAction =
    createCrewMutation.isPending ||
    updateCrewMutation.isPending ||
    deleteCrewMutation.isPending ||
    (activeTab === "crew" && (isSavingLocal || isDeletingLocal));

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setEditingMovieId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setEditingMovieId(movie.id);
    setIsFormOpen(true);
  };

  const handleMovieSubmit = (data: ValidatedMoviePayload) => {
    setMovieFormPendingData(data);
    setIsConfirmMovieOpen(true);
  };

  const executeSaveMovie = async (validated: ValidatedMoviePayload) => {
    try {
      setIsSavingLocal(true);

      if (editingMovie) {
        const updatedMovie: UpdateMovie = {
          title: validated.title,
          description: validated.description,
          category: validated.category,
          thumbnail:
            validated.thumbnail instanceof File ||
            typeof validated.thumbnail === "string"
              ? validated.thumbnail
              : editingMovie.thumbnail,
          youtubeUrl: validated.youtubeUrl,
          year: validated.year,
          matchRate: validated.matchRate,
          ageRating: validated.ageRating,
          duration: validated.duration,
          university: validated.university || null,
          director: validated.director || null,
          producer: validated.producer || null,
          writer: validated.writer || null,
          cast: validated.cast || null,
          btsVideo: validated.btsVideo || null,
          btsPhotos: (validated.btsPhotos as UpdateMovie["btsPhotos"]) || null,
        };
        await updateMovieMutation.mutateAsync({
          id: editingMovieId!,
          movie: updatedMovie,
        });
        showToast(LOCALIZATION.TOAST.EDIT_MOVIE_SUCCESS, "success");
      } else {
        const newMoviePayload: CreateMovie = {
          title: validated.title,
          description: validated.description,
          category: validated.category,
          thumbnail: validated.thumbnail as File,
          youtubeUrl: validated.youtubeUrl,
          year: validated.year,
          matchRate: validated.matchRate,
          ageRating: validated.ageRating,
          duration: validated.duration,
          university: validated.university || undefined,
          director: validated.director || undefined,
          producer: validated.producer || undefined,
          writer: validated.writer || undefined,
          cast: validated.cast || undefined,
          btsVideo: validated.btsVideo || undefined,
          btsPhotos:
            (validated.btsPhotos as CreateMovie["btsPhotos"]) || undefined,
        };
        await createMovieMutation.mutateAsync(newMoviePayload);
        showToast(LOCALIZATION.TOAST.ADD_MOVIE_SUCCESS, "success");
      }
      setIsFormOpen(false);
      setEditingMovie(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : LOCALIZATION.ERRORS.SAVE_MOVIE;
      showToast(errorMessage, "error");
      console.error(err);
    } finally {
      setIsSavingLocal(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteMovieId) {
      try {
        setIsDeletingLocal(true);
        await deleteMovieMutation.mutateAsync(deleteMovieId);
        showToast(LOCALIZATION.TOAST.DELETE_MOVIE_SUCCESS, "success");
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : LOCALIZATION.ERRORS.DELETE;
        showToast(errorMessage, "error");
      } finally {
        setIsDeletingLocal(false);
        setDeleteMovieId(null);
      }
    }
  };

  const handleOpenAddCrew = () => {
    setEditingCrew(null);
    setCrewNameInput("");
    setCrewPhotoInput(null);
    setCrewPhotoName(null);
    setCrewPhotoPreview(null);
    setRawCrewFile(null);
    setIsCrewFormOpen(true);
  };

  const handleOpenEditCrew = (crew: CrewMember) => {
    setEditingCrew(crew);
    setCrewNameInput(crew.name);
    setCrewPhotoInput(null);
    setCrewPhotoName(null);
    setCrewPhotoPreview(crew.photoUrl || null);
    setRawCrewFile(null);
    setIsCrewFormOpen(true);
  };

  const handleCrewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crewNameInput.trim()) {
      showToast(LOCALIZATION.TOAST.REQUIRED_NAME, "error");
      return;
    }
    setIsConfirmCrewOpen(true);
  };

  const executeSaveCrew = async () => {
    try {
      setIsSavingLocal(true);

      if (editingCrew) {
        await updateCrewMutation.mutateAsync({
          id: editingCrew.id,
          crewMember: {
            name: crewNameInput.trim(),
            photo: crewPhotoInput || editingCrew.photoUrl || null,
          },
        });
        showToast(LOCALIZATION.TOAST.EDIT_CREW_SUCCESS, "success");
      } else {
        await createCrewMutation.mutateAsync({
          name: crewNameInput.trim(),
          photo: crewPhotoInput,
        });
        showToast(LOCALIZATION.TOAST.ADD_CREW_SUCCESS, "success");
      }
      setIsCrewFormOpen(false);
      setEditingCrew(null);
      setCrewNameInput("");
      setCrewPhotoInput(null);
      setCrewPhotoName(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : LOCALIZATION.ERRORS.SAVE;
      showToast(errorMessage, "error");
      console.error(err);
    } finally {
      setIsSavingLocal(false);
    }
  };

  const handleCrewDeleteConfirm = async () => {
    if (deleteCrewId) {
      try {
        setIsDeletingLocal(true);
        await deleteCrewMutation.mutateAsync(deleteCrewId);
        showToast(LOCALIZATION.TOAST.DELETE_CREW_SUCCESS, "success");
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : LOCALIZATION.ERRORS.DELETE;
        showToast(errorMessage, "error");
        console.error(err);
      } finally {
        setIsDeletingLocal(false);
        setDeleteCrewId(null);
      }
    }
  };

  const getFilteredAndSortedCrew = () => {
    let list = [...availableCrew];
    if (crewSearchQuery.trim() !== "") {
      const q = crewSearchQuery.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => a.name.localeCompare(b.name, "th"));
    return list;
  };

  const filteredCrew = getFilteredAndSortedCrew();

  const totalViews = movies.reduce((sum, m) => sum + (m.views || 0), 0);

  const getFilteredAndSortedMovies = () => {
    let list = [...movies];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q),
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

  if (isMoviesLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans select-none pb-20">
      <Navbar
        searchQuery=""
        onSearchChange={() => {}}
        selectedCategory={null}
        onCategoryChange={() => {}}
        showMyListOnly={false}
        onMyListOnlyChange={() => {}}
        currentUser={currentUser}
        onSignOut={() => {
          logoutMutation.mutate();
        }}
        onSignInClick={() => {}}
        categories={availableCategories}
      />

      <main className="flex-1 px-6 md:px-16 pt-28 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Link
                href="/"
                className="hover:text-brand transition-colors flex items-center gap-1"
              >
                <ArrowBackIcon className="text-sm" /> {LOCALIZATION.ADMIN.BACK_HOME}
              </Link>
              <span>/</span>
              <span className="text-zinc-300">{LOCALIZATION.ADMIN.DASHBOARD_TITLE}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              {LOCALIZATION.ADMIN.DASHBOARD_TITLE}
            </h1>
          </div>

          <Button
            onClick={activeTab === "movies" ? handleOpenAdd : handleOpenAddCrew}
            className="flex items-center justify-center gap-2"
          >
            <AddIcon className="text-lg" />
            {activeTab === "movies" ? LOCALIZATION.ADMIN.ADD_MOVIE : LOCALIZATION.ADMIN.ADD_CREW}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
          <StatsCard
            title={LOCALIZATION.ADMIN.TOTAL_TITLES}
            value={movies.length}
            icon={<MovieIcon className="text-2xl" />}
          />
          <StatsCard
            title={LOCALIZATION.ADMIN.TOTAL_CATEGORIES}
            value={availableCategories.length}
            icon={<CategoryIcon className="text-2xl" />}
            iconClassName="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          />
          <StatsCard
            title={LOCALIZATION.ADMIN.TOTAL_VIEWS}
            value={totalViews.toLocaleString()}
            icon={<VisibilityIcon className="text-2xl" />}
            iconClassName="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
          />
          <StatsCard
            title={LOCALIZATION.ADMIN.TOTAL_CREW}
            value={availableCrew.length}
            icon={<PeopleIcon className="text-2xl" />}
            iconClassName="bg-violet-500/10 border-violet-500/20 text-violet-400"
          />
        </div>

        <div className="flex border-b border-zinc-800/60 gap-8">
          <button
            onClick={() => setActiveTab("movies")}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === "movies"
                ? "text-brand"
                : "text-zinc-400 hover:text-zinc-200 cursor-pointer"
            }`}
          >
            {LOCALIZATION.ADMIN.TAB_MOVIES(movies.length)}
            {activeTab === "movies" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full animate-fade-in" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("crew")}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === "crew"
                ? "text-brand"
                : "text-zinc-400 hover:text-zinc-200 cursor-pointer"
            }`}
          >
            {LOCALIZATION.ADMIN.TAB_CREW(availableCrew.length)}
            {activeTab === "crew" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full animate-fade-in" />
            )}
          </button>
        </div>

        {activeTab === "movies" ? (
          <div className="bg-card border border-zinc-800/35 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md animate-fade-in">
            <div className="p-5 border-b border-zinc-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={LOCALIZATION.ADMIN.SEARCH_MOVIE_PLACEHOLDER}
              />

              <div className="flex items-center gap-3 self-end md:self-auto">
                <FilterSelect
                  label={LOCALIZATION.ADMIN.FILTER_LABEL}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    { value: "", label: LOCALIZATION.ADMIN.FILTER_ALL },
                    ...availableCategories.map((cat) => ({
                      value: cat.name,
                      label: cat.name,
                    })),
                  ]}
                />

                <FilterSelect
                  label={LOCALIZATION.ADMIN.SORT_LABEL}
                  value={sortBy}
                  onChange={(val) => setSortBy(val as Sortby)}
                  options={[
                    { value: "title", label: LOCALIZATION.ADMIN.SORT_ALPHA },
                    { value: "year", label: LOCALIZATION.ADMIN.SORT_YEAR },
                    { value: "views", label: LOCALIZATION.ADMIN.SORT_VIEWS },
                  ]}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/40 text-xs font-bold text-zinc-400 uppercase bg-zinc-950/20">
                    <th className="py-4 px-6">{LOCALIZATION.ADMIN.TABLE_MOVIE}</th>
                    <th className="py-4 px-6">{LOCALIZATION.ADMIN.TABLE_GENRE}</th>
                    <th className="py-4 px-6">{LOCALIZATION.ADMIN.TABLE_RELEASE}</th>
                    <th className="py-4 px-6">{LOCALIZATION.ADMIN.TABLE_DURATION}</th>
                    <th className="py-4 px-6">{LOCALIZATION.ADMIN.TABLE_STATS}</th>
                    <th className="py-4 px-6 text-right">{LOCALIZATION.ADMIN.TABLE_ACTIONS}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30 text-sm">
                  {filteredMovies.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-zinc-500 font-light"
                      >
                        {LOCALIZATION.ADMIN.NO_MOVIES}
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
                            <span className="px-1 py-0.5 text-[9px] font-bold border border-zinc-700 text-zinc-400 rounded leading-none">
                              {movie.ageRating}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">
                              {LOCALIZATION.ADMIN.MATCH_RATE(movie.matchRate)}
                            </span>
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
                            {LOCALIZATION.ADMIN.VIEWS_COUNT(movie.views || 0)}
                          </div>
                          <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <StarIcon className="text-[10px] text-zinc-500" />
                            {LOCALIZATION.ADMIN.REVIEWS_COUNT(movie.ratings?.length || 0)}
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
        ) : (
          <div className="bg-card border border-zinc-800/35 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md animate-fade-in">
            <div className="p-5 border-b border-zinc-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <SearchInput
                value={crewSearchQuery}
                onChange={setCrewSearchQuery}
                placeholder={LOCALIZATION.ADMIN.SEARCH_CREW_PLACEHOLDER}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/40 text-xs font-bold text-zinc-400 uppercase bg-zinc-950/20">
                    <th className="py-4 px-6">{LOCALIZATION.ADMIN.TABLE_CREW_NAME}</th>
                    <th className="py-4 px-6">{LOCALIZATION.ADMIN.TABLE_CREW_STATUS}</th>
                    <th className="py-4 px-6">{LOCALIZATION.ADMIN.TABLE_CREW_DATE}</th>
                    <th className="py-4 px-6 text-right">{LOCALIZATION.ADMIN.TABLE_ACTIONS}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30 text-sm">
                  {filteredCrew.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-16 text-center text-zinc-500 font-light"
                      >
                        {LOCALIZATION.ADMIN.NO_CREW}
                      </td>
                    </tr>
                  ) : (
                    filteredCrew.map((member) => {
                      const movieCount = movies.filter((m) =>
                        m.crew?.some((c) => c.crewMember?.id === member.id),
                      ).length;

                      return (
                        <tr
                          key={member.id}
                          className="group/row hover:bg-zinc-900/10 transition-colors"
                        >
                          <td className="py-4 px-6 flex items-center gap-4">
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt={member.name}
                                className="w-10 h-10 rounded-full object-cover border border-zinc-800 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand flex-shrink-0">
                                <PersonIcon className="text-lg" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-white group-hover/row:text-brand transition-colors">
                                {member.name}
                              </h4>
                              <p className="text-[10px] text-zinc-500 font-mono">
                                ID: {member.id}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                movieCount > 0
                                  ? "bg-brand/10 text-brand border border-brand/20"
                                  : "bg-zinc-800/60 text-zinc-400 border border-zinc-800"
                              }`}
                            >
                              มีส่วนร่วมภาพยนตร์ {movieCount} เรื่อง
                            </span>
                          </td>

                          <td className="py-4 px-6 text-zinc-400 font-light">
                            {new Date(member.createdAt).toLocaleDateString(
                              "th-TH",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditCrew(member)}
                                className="p-2 rounded-lg bg-zinc-800/80 hover:bg-brand/20 text-zinc-400 hover:text-brand border border-zinc-800 hover:border-brand/30 transition-all cursor-pointer"
                              >
                                <EditIcon className="text-sm" />
                              </button>
                              <button
                                onClick={() => setDeleteCrewId(member.id)}
                                className="p-2 rounded-lg bg-zinc-800/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 transition-all cursor-pointer"
                              >
                                <DeleteIcon className="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <MovieFormSidebar
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleMovieSubmit}
        editingMovie={editingMovie}
        categories={availableCategories}
        ageRatings={availableAgeRatings}
        universities={availableUniversities}
        crewOptions={crewOptions}
      />

      {isCrewFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-zinc-800/60 p-6 md:p-8 rounded-2xl max-w-md w-full space-y-6 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setIsCrewFormOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition-colors cursor-pointer border-0"
            >
              <CloseIcon />
            </button>

            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                {editingCrew
                  ? LOCALIZATION.CREW_FORM.EDIT_TITLE
                  : LOCALIZATION.CREW_FORM.ADD_TITLE}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-light">
                {LOCALIZATION.CREW_FORM.SUBTITLE}
              </p>
            </div>

            <form onSubmit={handleCrewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  {LOCALIZATION.CREW_FORM.NAME_LABEL}
                </label>
                <input
                  type="text"
                  placeholder={LOCALIZATION.CREW_FORM.NAME_PLACEHOLDER}
                  value={crewNameInput}
                  onChange={(e) => setCrewNameInput(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 focus:border-brand rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  {LOCALIZATION.CREW_FORM.PHOTO_LABEL}
                </label>
                <div className="relative group/file">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (file) {
                        setRawCrewFile(file);
                        setCropImageSrc(URL.createObjectURL(file));
                        setIsCropModalOpen(true);
                        e.target.value = "";
                      }
                    }}
                  />
                  <div className="w-full bg-black/40 border border-zinc-800 group-hover/file:border-brand rounded-xl px-4 py-3 text-sm text-zinc-405 flex items-center justify-between transition-colors">
                    <span
                      className={
                        crewPhotoName
                          ? "text-white font-medium truncate max-w-[70%]"
                          : "text-zinc-400"
                      }
                    >
                      {crewPhotoName ||
                        LOCALIZATION.CREW_FORM.PHOTO_PLACEHOLDER}
                    </span>
                    <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold group-hover/file:bg-brand group-hover/file:text-white transition-colors">
                      {LOCALIZATION.CREW_FORM.BROWSE}
                    </span>
                  </div>
                </div>
                {crewPhotoPreview && (
                  <div className="flex items-center gap-3 mt-3 pl-1">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-zinc-800 bg-black/40 shadow-inner group/crewpreview">
                      <img
                        src={crewPhotoPreview}
                        alt="Crew Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCrewPhotoInput(null);
                          setCrewPhotoName(null);
                          setCrewPhotoPreview(
                            editingCrew ? editingCrew.photoUrl || null : null,
                          );
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/crewpreview:opacity-100 transition-opacity flex items-center justify-center text-red-500 cursor-pointer border-0"
                      >
                        <CloseIcon className="text-sm text-white" />
                      </button>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-zinc-300 font-semibold">
                        {LOCALIZATION.CREW_FORM.PREVIEW_TITLE}
                      </span>
                      <span className="text-[10px] text-zinc-500 leading-relaxed">
                        {crewPhotoName
                          ? LOCALIZATION.CREW_FORM.PREVIEW_CROPPED
                          : LOCALIZATION.CREW_FORM.PREVIEW_ORIGINAL}
                      </span>
                      {crewPhotoName && rawCrewFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setCropImageSrc(URL.createObjectURL(rawCrewFile));
                            setIsCropModalOpen(true);
                          }}
                          className="text-[10px] text-brand hover:underline font-semibold w-fit text-left mt-1 cursor-pointer border-0 bg-transparent p-0"
                        >
                          {LOCALIZATION.CREW_FORM.RECROP}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-800/40 flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCrewFormOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl"
                >
                  {LOCALIZATION.CREW_FORM.CANCEL}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl"
                >
                  {editingCrew
                    ? LOCALIZATION.CREW_FORM.SAVE
                    : LOCALIZATION.CREW_FORM.ADD}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteMovieId !== null}
        title={LOCALIZATION.CONFIRM.DELETE_MOVIE_TITLE}
        message={LOCALIZATION.CONFIRM.DELETE_MOVIE_MSG}
        variant="danger"
        confirmText={LOCALIZATION.CONFIRM.DELETE_MOVIE_BTN}
        cancelText={LOCALIZATION.CONFIRM.CANCEL}
        onClose={() => setDeleteMovieId(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmModal
        isOpen={deleteCrewId !== null}
        title={LOCALIZATION.CONFIRM.DELETE_CREW_TITLE}
        message={LOCALIZATION.CONFIRM.DELETE_CREW_MSG}
        variant="danger"
        confirmText={LOCALIZATION.CONFIRM.DELETE_CREW_BTN}
        cancelText={LOCALIZATION.CONFIRM.CANCEL}
        onClose={() => setDeleteCrewId(null)}
        onConfirm={handleCrewDeleteConfirm}
      />

      <ConfirmModal
        isOpen={isConfirmMovieOpen && movieFormPendingData !== null}
        title={
          editingMovie
            ? LOCALIZATION.CONFIRM.EDIT_MOVIE_TITLE
            : LOCALIZATION.CONFIRM.ADD_MOVIE_TITLE
        }
        message={
          movieFormPendingData
            ? editingMovie
              ? LOCALIZATION.CONFIRM.EDIT_MOVIE_MSG(movieFormPendingData.title)
              : LOCALIZATION.CONFIRM.ADD_MOVIE_MSG(movieFormPendingData.title)
            : ""
        }
        iconType="movie"
        confirmText={LOCALIZATION.CONFIRM.CONFIRM}
        cancelText={LOCALIZATION.CONFIRM.CANCEL}
        onClose={() => {
          setIsConfirmMovieOpen(false);
          setMovieFormPendingData(null);
        }}
        onConfirm={async () => {
          setIsConfirmMovieOpen(false);
          if (movieFormPendingData) {
            await executeSaveMovie(movieFormPendingData);
            setMovieFormPendingData(null);
          }
        }}
      />

      <ConfirmModal
        isOpen={isConfirmCrewOpen}
        title={
          editingCrew
            ? LOCALIZATION.CONFIRM.EDIT_CREW_TITLE
            : LOCALIZATION.CONFIRM.ADD_CREW_TITLE
        }
        message={
          editingCrew
            ? LOCALIZATION.CONFIRM.EDIT_CREW_MSG(crewNameInput.trim())
            : LOCALIZATION.CONFIRM.ADD_CREW_MSG(crewNameInput.trim())
        }
        iconType="crew"
        confirmText={LOCALIZATION.CONFIRM.CONFIRM}
        cancelText={LOCALIZATION.CONFIRM.CANCEL}
        onClose={() => setIsConfirmCrewOpen(false)}
        onConfirm={async () => {
          setIsConfirmCrewOpen(false);
          await executeSaveCrew();
        }}
      />

      <ImageCropper
        isOpen={isCropModalOpen}
        imageSrc={cropImageSrc}
        fileName={rawCrewFile?.name}
        onClose={() => {
          setIsCropModalOpen(false);
          setRawCrewFile(null);
          setCropImageSrc(null);
        }}
        onConfirm={(croppedFile, previewUrl) => {
          setCrewPhotoInput(croppedFile);
          setCrewPhotoName(croppedFile.name);
          setCrewPhotoPreview(previewUrl);
          setIsCropModalOpen(false);
        }}
      />

      {isMutating && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800/60" />
              <div className="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin" />
            </div>
            <div className="space-y-1.5 text-center">
              <h3 className="text-xl font-bold tracking-wide text-white">
                {isDeleting
                  ? isCrewAction
                    ? LOCALIZATION.LOADING.DELETE_CREW
                    : LOCALIZATION.LOADING.DELETE_MOVIE
                  : isCrewAction
                    ? LOCALIZATION.LOADING.SAVE_CREW
                    : LOCALIZATION.LOADING.SAVE_MOVIE}
              </h3>
              <p className="text-xs text-zinc-400 font-light">
                {isDeleting
                  ? isCrewAction
                    ? LOCALIZATION.LOADING.SUB_DELETE_CREW
                    : LOCALIZATION.LOADING.SUB_DELETE_MOVIE
                  : isCrewAction
                    ? LOCALIZATION.LOADING.SUB_SAVE_CREW
                    : LOCALIZATION.LOADING.SUB_SAVE_MOVIE}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
