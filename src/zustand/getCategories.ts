import { create } from "zustand";
import categoryService from "@/services/category.service";
import type { Category } from "@/interface/Categories";
import type { INITIAL_TYPE } from "./initialType";

const initialState = {
  loading: false,
  success: false,
  error: false,
  data: null,
  errorData: null,
};


interface CategoriesStore extends INITIAL_TYPE {
  data: Category[] | null;
}

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  ...initialState,

  execute: async () => {
    if (get().data) return;
    set({ ...initialState, loading: true });
    try {
      const res = await categoryService.getCategories();
      set({
        ...initialState,
        success: true,
        data: res,
      });
    } catch (error: any) {
      console.error("Error in data fetch:", error);
      set({
        ...initialState,
        error: true,
        errorData: error?.message || error,
      });
    }
  },
}));
