import { create } from "zustand";
import { movieService, authService } from "@/infra/container";
import { User } from "@/core/domain/user";

interface AppState {
  currentUser: User | null;
  favorites: string[];
  setCurrentUser: (user: User | null) => void;
  setFavorites: (favorites: string[]) => void;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (movieId: string) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  favorites: [],
  setCurrentUser: (user) => set({ currentUser: user }),
  setFavorites: (favs) => set({ favorites: favs }),
  fetchFavorites: async () => {
    try {
      const favs = await movieService.getFavorites();
      set({ favorites: favs });
    } catch (err) {
      console.error(err);
    }
  },
  toggleFavorite: async (movieId) => {
    const currentFavs = get().favorites;
    const isFav = currentFavs.includes(movieId);
    try {
      if (isFav) {
        await movieService.removeFavorite(movieId);
        set({ favorites: currentFavs.filter((id) => id !== movieId) });
      } else {
        await movieService.addFavorite(movieId);
        set({ favorites: [...currentFavs, movieId] });
      }
    } catch (err) {
      console.error(err);
    }
  },
  fetchCurrentUser: async () => {
    try {
      const user = await authService.getCurrentUser();
      set({ currentUser: user });
    } catch (err) {
      set({ currentUser: null });
    }
  },
}));
