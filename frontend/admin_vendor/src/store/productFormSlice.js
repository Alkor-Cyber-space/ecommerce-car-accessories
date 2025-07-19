// src/store/productFormSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  description: '',
  minQty: '',
  price: '',
  sizes: '',
  manufactureDate: '',
  category: '',
  stock: '',
  tags: [],
  images: {
    main: null,
    close: null,
    other1: null,
    other2: null,
    other3: null,
    other4: null,
  },
  isActive: false,
};

const productFormSlice = createSlice({
  name: 'productForm',
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    updateImage: (state, action) => {
  const { key, file } = action.payload;
  state.images[key] = file;
},

    updateTags: (state, action) => {
      state.tags = action.payload;
    },
    toggleActive: (state) => {
      state.isActive = !state.isActive;
    },
    resetForm: () => initialState,
    loadForm: (state, action) => {
      return { ...initialState, ...action.payload };
    },
  },
});

export const {
  updateField,
  updateImage,
  updateTags,
  toggleActive,
  resetForm,
  loadForm,
} = productFormSlice.actions;

export default productFormSlice.reducer;