// src/components/vendor/StepIndicator.jsx
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentStep,
  setCompletedStep,
} from "../../store/vendorRegisterSlice";
import loggo from "../../assets/loggo.png";

const steps = [
  "Company Details",
  "Contact Details",
  "KYC Documents",
  "Business Documents",
  "Bank & Tax Details",
  "Agreements & Supporting Docs",
];

export default function StepIndicator() {
  const location = useLocation();
  const dispatch = useDispatch();

  const currentStep = useSelector(
    (state) => state.vendorRegister.currentStep
  );
  const completedSteps = useSelector(
    (state) => state.vendorRegister.completedSteps
  );

  useEffect(() => {
    // ✅ If Redux lost state (like after refresh), restore from localStorage
    const savedCompleted = JSON.parse(
      localStorage.getItem("vendor_completed_steps") || "[]"
    );
    const savedCurrent = parseInt(
      localStorage.getItem("vendor_current_step") || "0"
    );

    if (completedSteps.length === 0 && savedCompleted.length > 0) {
      // restore tick marks into Redux
      savedCompleted.forEach((step) => dispatch(setCompletedStep(step)));
    }

    if (currentStep === 0 && savedCurrent > 0) {
      dispatch(setCurrentStep(savedCurrent));
    }
  }, []);

  useEffect(() => {
    // ✅ Map URL to step index & persist
    const path = location.pathname;
    const stepMap = {
      "/vendor-register/company-details": 0,
      "/vendor-register/contact-details": 1,
      "/vendor-register/kyc-documents": 2,
      "/vendor-register/business-documents": 3,
      "/vendor-register/bank-details": 4,
      "/vendor-register/agreements": 5,
    };

    const stepIdx = stepMap[path] ?? 0;
    dispatch(setCurrentStep(stepIdx));
    localStorage.setItem("vendor_current_step", stepIdx);
  }, [location.pathname, dispatch]);

  return (
    <>
      <div className="w-full bg-[#030130] px-2">
        <img src={loggo} alt="Logo" className="h-20" />
      </div>

      <div className="w-full flex justify-center px-10 py-6">
        <div className="flex items-center justify-between w-full">
          {steps.map((label, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = completedSteps.includes(idx);

            return (
              <div
                key={idx}
                className="flex items-center justify-center gap-2 flex-1"
              >
                {/* Circle */}
                <div
                  className={`w-6 h-6 md:w-8 md:h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center 
                  ${
                    isCompleted
                      ? "bg-[#21A537] text-white"
                      : isActive
                      ? "border-[#5737B4]"
                      : "border-gray-300"
                  }`}
                >
                  {isCompleted ? "✓" : ""}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] md:text-sm ${
                    isCompleted
                      ? "text-black font-bold"
                      : isActive
                      ? "font-bold text-black"
                      : "text-gray-300"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
