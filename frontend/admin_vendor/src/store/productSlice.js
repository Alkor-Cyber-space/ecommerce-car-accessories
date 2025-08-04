import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProductByIdApi } from '../services/allAPI'; // 🔁 Adjust this path if needed

// Async thunk for fetching product by ID
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getProductByIdApi(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    productDetails: null,  // ⬅️ For storing single product fetched
    error: null,
    loading: false,
  },
  reducers: {
    addProduct: (state, action) => {
      state.products.push(action.payload);
      console.log("Product Added:", action.payload);
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetails = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addProduct, updateProduct, setProductsLoading, setProductsError } = productsSlice.actions;

export default productsSlice.reducer;
