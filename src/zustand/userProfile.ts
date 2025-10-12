import { create } from "zustand";
import type { INITIAL_TYPE } from "./initialType";
import userService from "@/services/auth.service";

interface UserInterface extends INITIAL_TYPE {
  user: any | null;  
  setUser: (userData: any) => void;
  clearUser: () => void;
}

const initialState = {
  loading: false,
  success: false,
  error: false,
  user: null,
  errorData: null,
};

export const getUserProfile = create<UserInterface>((set, get) => ({
  ...initialState,

  execute: async () => {
    if (get().user) return;
    set({ ...initialState, loading: true });
    try {
      const res = await userService.userProfile();
      set({ ...initialState, loading: false, success: true, user: res });
    } catch (error) {
      console.log("get user profile error", error);
      set({ ...initialState, loading: false, error: true, errorData: error });
    }
  },

  setUser: (userData) => {
    set((state) => ({
      ...state,
      user: userData,
      success: true,
      loading: false,
      error: false,
    }));
  },

  clearUser: () => {
    set({ ...initialState });
  },
}));
