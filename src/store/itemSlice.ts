import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ItemModel } from "../Models/ItemModel";

interface ItemState {
  items: ItemModel[];
}

const initialState: ItemState = {
  items: [],
};

const itemSlice = createSlice({
  name: "item",
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<ItemModel[]>) => {
      state.items = action.payload;
    },
    clearItems: (state) => {
      state.items = [];
    },
  },
});

export const { setItems, clearItems } = itemSlice.actions;
export default itemSlice.reducer;
