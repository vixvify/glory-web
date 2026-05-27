import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/core/domain/user";

interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  toast: {
    message: string;
    type: "success" | "error" | "info" | "warning";
    isVisible: boolean;
  } | null;

  showToast: (
    message: string,
    type?: "success" | "error" | "info" | "warning"
  ) => void;

  hideToast: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      toast: null,

      setCurrentUser: (user) => set({ currentUser: user }),

      showToast: (message, type = "success") => {
        set({
          toast: {
            message,
            type,
            isVisible: true,
          },
        });

        setTimeout(() => {
          get().hideToast();
        }, 4000);
      },

      hideToast: () => {
        const currentToast = get().toast;

        if (currentToast) {
          set({
            toast: {
              ...currentToast,
              isVisible: false,
            },
          });
        }
      },
    }),
    {
      name: "app-storage",
    }
  )
);