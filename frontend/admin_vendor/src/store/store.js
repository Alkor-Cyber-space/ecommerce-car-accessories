import { configureStore } from "@reduxjs/toolkit";
import vendorRegisterSlice from './vendorRegisterSlice'
import productsSlice from './productSlice'

export const store = configureStore({
    reducer: {
        vendorRegister: vendorRegisterSlice,
        products: productsSlice,
    },
})