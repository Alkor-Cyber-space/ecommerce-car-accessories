// src/redux/vendorRegisterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Auth (before /vendor-register flow starts)
  email: '',
  phone: '',
  password: '',
  otpVerified: false,

  // Progress tracking
  currentStep: 0, // ✅ Start from Company Details
  registrationStatus: 'PENDING',

  // Step 0: Company
  companyDetails: null,

  // Step 1: Contact
  contactDetails: null,

  // Step 2: KYC
  kycDocuments: [],

  // Step 3: Business
  businessDocs: null,

  // Step 4: Bank
  bankDetails: null,

  // Step 5: Agreements
  agreements: [],

  // Global state
  error: null,
  loading: false,
};

const vendorRegisterSlice = createSlice({
  name: 'vendorRegister',
  initialState,
  reducers: {
    // Credentials & OTP
    setCredentials: (state, action) => {
      const { email, phone, password } = action.payload;
      state.email = email;
      state.phone = phone;
      state.password = password;
    },
    setOtpVerified: (state, action) => {
      state.otpVerified = action.payload;
    },

    // Step Progress
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setRegistrationStatus: (state, action) => {
      state.registrationStatus = action.payload;
    },

    // Company
    setCompanyDetails: (state, action) => {
      state.companyDetails = action.payload;
    },

    // Contact
    setContactDetails: (state, action) => {
      state.contactDetails = action.payload;
    },

    // KYC
    addKycDocument: (state, action) => {
      state.kycDocuments.push(action.payload);
    },
    removeKycDocument: (state, action) => {
      state.kycDocuments = state.kycDocuments.filter(doc => doc.id !== action.payload);
    },

    // Business Docs
    setBusinessDocs: (state, action) => {
      state.businessDocs = action.payload;
    },

    // Bank
    setBankDetails: (state, action) => {
      state.bankDetails = action.payload;
    },

    // Agreements
    setAgreements: (state, action) => {
      state.agreements = action.payload;
    },

    // General
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
  removeKycDocument,
  setBusinessDocs,
  setBankDetails,
  setAgreements,
  setRegistrationStatus,
  setError,
  setLoading,
} = vendorRegisterSlice.actions;

export default vendorRegisterSlice.reducer;
