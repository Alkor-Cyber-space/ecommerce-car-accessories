// src/redux/slices/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehicleCategoryApi, getVehicleCategoriesApi, productcategory, getProductcategorylist } from '../services/allAPI';
import { toast } from 'react-toastify';

// --------------------------
// ASYNC THUNKS
// --------------------------

export const fetchVehicleCategories = createAsyncThunk(
  'category/fetchVehicleCategories',
  async (_, thunkAPI) => {
    try {
      const response = await getVehicleCategoriesApi();
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch vehicle categories');
    }
  }
);

export const fetchProductCategories = createAsyncThunk(
  'category/fetchProductCategories',
  async (_, thunkAPI) => {
    try {
      const response = await getProductcategorylist();
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch product categories');
    }
  }
);

export const addVehicleCategory = createAsyncThunk(
  'category/addVehicleCategory',
  async (data, thunkAPI) => {
    try {
      const response = await vehicleCategoryApi(data);
      toast.success(response.message || 'Vehicle category created!');
      return data; // return original form data to push into the list
    } catch (error) {
      toast.error(error.response?.data || 'Failed to create vehicle category');
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const addProductCategory = createAsyncThunk(
  'category/addProductCategory',
  async (data, thunkAPI) => {
    try {
      const response = await productcategory({ name: data.name });
      toast.success('Product category created!');
      return { name: data.name };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product category');
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// --------------------------
// SLICE
// --------------------------

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    vehicleCategories: [],
    productCategories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Vehicle
      .addCase(fetchVehicleCategories.fulfilled, (state, action) => {
        state.vehicleCategories = action.payload;
      })
      .addCase(addVehicleCategory.fulfilled, (state, action) => {
        state.vehicleCategories.push(action.payload);
      })

      // Product
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.productCategories = action.payload;
      })
      .addCase(addProductCategory.fulfilled, (state, action) => {
        state.productCategories.push(action.payload);
      })

      // Common Loading/Error (Optional)
      .addMatcher((action) => action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.endsWith('/fulfilled'), (state) => {
        state.loading = false;
      })
      .addMatcher((action) => action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export default categorySlice.reducer;
