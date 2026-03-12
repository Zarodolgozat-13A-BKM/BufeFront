import { createSlice, createSelector } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CategoryModel } from "../Models/CategoryModel";
import type { RootState } from "./store";

interface CategoryState {
  categories: CategoryModel[];
}

const initialState: CategoryState = {
  categories: [],
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<CategoryModel[]>) => {
      state.categories = action.payload;
    },
    clearCategories: (state) => {
      state.categories = [];
    },
  },
});

export const selectAllItems = createSelector(
  (state: RootState) => state.category.categories,
  (categories) => categories.flatMap((c) => c.items)
);

export const { setCategories, clearCategories } = categorySlice.actions;
export default categorySlice.reducer;
