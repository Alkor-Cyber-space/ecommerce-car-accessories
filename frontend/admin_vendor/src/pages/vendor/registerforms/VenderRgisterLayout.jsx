import React from "react";
import { Outlet } from "react-router-dom";
import StepIndicator from "../../../components/vendor/StepIndicator";
import { useSelector } from "react-redux";



export default function VendorRegisterLayout() {
  const currentStep = useSelector((state) => state.vendorRegister.currentStep);

  return (
    <>
      {/* Header */}

      <StepIndicator currentStep={currentStep} />

      {/* Dynamic form outlet on right */}
      <div className="w-full  bg-[#ECECF0] flex justify-center items-center ">
        <Outlet />
      </div>
    </>
  );
}
