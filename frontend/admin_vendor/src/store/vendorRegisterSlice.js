// src/redux/vendorRegisterSlice.js
import { createSlice } from "@reduxjs/toolkit";

// ✅ Load from localStorage (if exists)
const savedSteps = JSON.parse(localStorage.getItem("vendor_completed_steps") || "[]");
const savedCurrentStep = parseInt(localStorage.getItem("vendor_current_step") || "0");

const initialState = {
  // Auth
  email: "",
  password: "",
  otpVerified: false,

  // Step tracking
  currentStep: savedCurrentStep,       
  completedSteps: savedSteps,         
  registrationStatus: "PENDING",

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

  // Global state
  error: null,
  loading: false,
};

const vendorRegisterSlice = createSlice({
  name: "vendorRegister",
  initialState,
  reducers: {
    resetVendorRegistration: (state) => {
      state.email = "";
      state.password = "";
      state.otpVerified = false;

      state.currentStep = 0;
      state.completedSteps = [];
      state.registrationStatus = "PENDING";

      state.companyDetails = null;
      state.contactDetails = null;
      state.kycDocuments = [];
      state.businessDocs = null;
      state.bankDetails = null;
      state.taxDocuments = null;
      state.agreements = [];

      localStorage.removeItem("vendor_current_step");
      localStorage.removeItem("vendor_completed_steps");
      localStorage.removeItem("vendorCompanyDetails");
      localStorage.removeItem("vendorContactDetails");
      localStorage.removeItem("vendorKycDocuments");
      localStorage.removeItem("vendorBusinessDocuments");
      localStorage.removeItem("vendorBankDocuments");
      localStorage.removeItem("vendorTaxDocuments");
      localStorage.removeItem("vendorAgreements");
    },

    // ✅ Save & persist current step
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
      localStorage.setItem("vendor_current_step", action.payload);
    },

    // ✅ Mark step completed & persist
    setCompletedStep: (state, action) => {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload);
        localStorage.setItem(
          "vendor_completed_steps",
          JSON.stringify(state.completedSteps)
        );
      }
    },

    //  Credentials + OTP
    setCredentials: (state, action) => {
      const { username, email,  password } = action.payload;
      state.username = username,
        state.email = email;
      state.password = password;
    },
    setOtpVerified: (state, action) => {
      state.otpVerified = action.payload;
    },

    // ✅ Step 0: Company
    setCompanyDetails: (state, action) => {
      state.companyDetails = action.payload;
      if (!state.completedSteps.includes(0)) {
        state.completedSteps.push(0);
        localStorage.setItem(
          "vendor_completed_steps",
          JSON.stringify(state.completedSteps)
        );
      }
    },

    // ✅ Step 1: Contact
    setContactDetails: (state, action) => {
      state.contactDetails = action.payload;
      if (!state.completedSteps.includes(1)) {
        state.completedSteps.push(1);
        localStorage.setItem(
          "vendor_completed_steps",
          JSON.stringify(state.completedSteps)
        );
      }
    },

    // ✅ Step 2: KYC
    addKycDocument: (state, action) => {
      state.kycDocuments.push(action.payload);
      if (!state.completedSteps.includes(2)) {
        state.completedSteps.push(2);
        localStorage.setItem(
          "vendor_completed_steps",
          JSON.stringify(state.completedSteps)
        );
      }
    },
    removeKycDocument: (state, action) => {
      state.kycDocuments = state.kycDocuments.filter(
        (doc) => doc.id !== action.payload
      );
    },

    // ✅ Step 3: Business Docs
    setBusinessDoc: (state, action) => {
      const { key, file } = action.payload;
      if (!state.businessDocs) {
        state.businessDocs = {};
      }
      state.businessDocs[key] = {
        name: file.name,
        size: file.size,
        type: file.type,
      };

      if (
        state.businessDocs.gstinCertificate &&
        state.businessDocs.registrationCertificate &&
        state.businessDocs.shopLicense &&
        !state.completedSteps.includes(3)
      ) {
        state.completedSteps.push(3);
        localStorage.setItem(
          "vendor_completed_steps",
          JSON.stringify(state.completedSteps)
        );
      }
    }
    ,
    // ✅ Step 4: Bank Details
    setBankDetails: (state, action) => {
      state.bankDetails = action.payload;
      if (!state.completedSteps.includes(4)) {
        state.completedSteps.push(4);
        localStorage.setItem(
          "vendor_completed_steps",
          JSON.stringify(state.completedSteps)
        );
      }
    },

    setTaxDocuments: (state, action) => {
      state.taxDocuments = action.payload;
      if (!state.completedSteps.includes(5)) {
        state.completedSteps.push(5);
        localStorage.setItem(
          "vendor_completed_steps",
          JSON.stringify(state.completedSteps)
        );
      }
    },

    // ✅ Step 5: Agreements
    setAgreements: (state, action) => {
      state.agreements = action.payload;
      if (!state.completedSteps.includes(6)) {
        state.completedSteps.push(6);
        localStorage.setItem(
          "vendor_completed_steps",
          JSON.stringify(state.completedSteps)
        );
      }
    },

    // ✅ Status & Errors
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
  resetVendorRegistration,
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
  setCompletedStep,
  setRegistrationStatus,
  setError,
  setLoading,
} = vendorRegisterSlice.actions;

export default vendorRegisterSlice.reducer;
