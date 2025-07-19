import { configureStore } from "@reduxjs/toolkit";
import vendorRegisterSlice from './vendorRegisterSlice'
import productsSlice from './productSlice'
import productFormSlice from './productFormSlice' 

export const store = configureStore({
    reducer: {
        vendorRegister: vendorRegisterSlice,
        products: productsSlice,
        productForm : productFormSlice,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['productForm/updateImage'],
        ignoredPaths: ['productForm.images'],
      },
    }),
})