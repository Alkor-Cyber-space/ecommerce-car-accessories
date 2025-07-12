// src/redux/vendorRegisterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Auth
  email: '',
  phone: '',
  password: '',
  otpVerified: false,

  // Step tracking
  currentStep: 0,
  completedSteps: [],
  registrationStatus: 'PENDING',

  // Step 0
  companyDetails: null,
  // Step 1
  contactDetails: null,
  // Step 2
  kycDocuments: [],
  // Step 3
  businessDocs: null,
  // Step 4
  bankDetails: null,
  taxDocuments: null,

  // Step 5
  agreements: [],
  completedSteps: [], 

  // Global state
  error: null,
  loading: false,
};

const vendorRegisterSlice = createSlice({
  name: 'vendorRegister',
  initialState,
  reducers: {
    // Step navigation
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },

    // Credentials + OTP
    setCredentials: (state, action) => {
      const { email, phone, password } = action.payload;
      state.email = email;
      state.phone = phone;
      state.password = password;
    },
    setOtpVerified: (state, action) => {
      state.otpVerified = action.payload;
    },

    // Step 0: Company
    setCompanyDetails: (state, action) => {
      state.companyDetails = action.payload;
      if (!state.completedSteps.includes(0)) {
        state.completedSteps.push(0);
      }
    },

    // Step 1: Contact
    setContactDetails: (state, action) => {
      state.contactDetails = action.payload;
      if (!state.completedSteps.includes(1)) {
        state.completedSteps.push(1);
      }
    },

    // Step 2: KYC
    addKycDocument: (state, action) => {
      state.kycDocuments.push(action.payload);
      if (!state.completedSteps.includes(2)) {
        state.completedSteps.push(2);
      }
    },
    removeKycDocument: (state, action) => {
      state.kycDocuments = state.kycDocuments.filter(doc => doc.id !== action.payload);
    },

    // Step 3: Business Docs
    setBusinessDoc: (state, action) => {
      const { key, file } = action.payload;
      if (!state.businessDocs) {
        state.businessDocs = {};
      }
      state.businessDocs[key] = file;

      if (
        state.businessDocs.gstinCertificate &&
        state.businessDocs.registrationCertificate &&
        state.businessDocs.shopLicense &&
        !state.completedSteps.includes(3)
      ) {
        state.completedSteps.push(3);
      }
    },

    // Step 4: Bank Details
    setBankDetails: (state, action) => {
      state.bankDetails = action.payload;
      if (!state.completedSteps.includes(4)) {
        state.completedSteps.push(4);
      }
    },

    setTaxDocuments: (state, action) => {
      state.taxDocuments = action.payload;
      if (!state.completedSteps.includes(5)) {
        state.completedSteps.push(5);
      }
    },

    // Step 5: Agreements
    setAgreements: (state, action) => {
      state.agreements = action.payload;
      if (!state.completedSteps.includes(6)) {
        state.completedSteps.push(6);
      }
    },

    setCompletedStep: (state, action) => {
    if (!state.completedSteps.includes(action.payload)) {
      state.completedSteps.push(action.payload);
    }
  },


    // Status & Errors
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
  removeKycDocument,
  setBusinessDoc,
  setBankDetails,
  setTaxDocuments,
  setAgreements,
  setCompletedStep ,
  setRegistrationStatus,
  setError,
  setLoading,
} = vendorRegisterSlice.actions;

export default vendorRegisterSlice.reducer;
