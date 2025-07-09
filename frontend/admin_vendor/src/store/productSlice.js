import { createSlice } from '@reduxjs/toolkit';

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    error: null,
    loading: false,
  },
  reducers: {
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    setProductsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProductsError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { addProduct, updateProduct } = productsSlice.actions;

export default productsSlice.reducer;
