import { createSlice } from '@reduxjs/toolkit';

const vendorRegisterSlice = createSlice({
  name: 'vendorRegister',
  initialState: {
    email: '',
    phone: '',
    password: '',
    otpVerified: false,
    currentStep: 1,
    companyDetails: null,
    contactDetails: null,
    kycDocuments: [],
    bankDetails: null,
    registrationStatus: 'PENDING',
    error: null,
    loading: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.password = action.payload.password;
    },
    setOtpVerified: (state, action) => {
      state.otpVerified = action.payload;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setCompanyDetails: (state, action) => {
      state.companyDetails = action.payload;
    },
    setContactDetails: (state, action) => {
      state.contactDetails = action.payload;
    },
    addKycDocument: (state, action) => {
      state.kycDocuments.push(action.payload);
    },
    setBankDetails: (state, action) => {
      state.bankDetails = action.payload;
    },
    setRegistrationStatus: (state, action) => {
      state.registrationStatus = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setCredentials,
  setOtpVerified,
  setCurrentStep,
  setCompanyDetails,
  setContactDetails,
  addKycDocument,
  setBankDetails,
  setRegistrationStatus,
  setError,
  setLoading,
} = vendorRegisterSlice.actions;

export default vendorRegisterSlice.reducer;
