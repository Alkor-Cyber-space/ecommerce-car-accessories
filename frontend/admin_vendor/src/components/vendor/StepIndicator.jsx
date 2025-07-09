import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentStep } from '../../store/vendorRegisterSlice';
import loggo from '../../assets/loggo.png';
import Header from './Header';

const steps = [
  'Company Details',
  'Contact Details',
  'KYC Documents',
  'Business Documents',
  'Bank & Tax Details',
  'Agreements & Supporting Docs',
];

export default function StepIndicator() {
  const location = useLocation();
  const dispatch = useDispatch();
  const currentStep = useSelector((state) => state.vendorRegister.currentStep);

  useEffect(() => {
    const path = location.pathname;

    const stepMap = {
      '/vendor-register/company-details': 0,
      '/vendor-register/contact-details': 1,
      '/vendor-register/kyc-documents': 2,
      '/vendor-register/business-documents': 3,
      '/vendor-register/bank-details': 4,
      '/vendor-register/agreements': 5,
    };

    dispatch(setCurrentStep(stepMap[path] ?? 0));
  }, [location.pathname, dispatch]);

  return (
    <>
      <div className='w-full bg-[#030130] px-2'>
        <img src={loggo} alt="" className="h-20" />
      </div>

      {/* Stepper Row */}
      {/* Stepper Circles with Labels – no lines, no numbers */}
      <div className="w-full flex justify-center px-10 py-6 ">
        <div className="flex items-center justify-between w-full ">
          {steps.map((label, idx) => {
            const isActive = idx === currentStep;

            return (
              <div key={idx} className="flex items-center justify-center gap-2 flex-1">
                {/* Circle */}
                <div
                  className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-3 ${isActive ? 'border-[#5737B4]' : 'border-gray-300'
                    }`}
                ></div>

                {/* Label */}
                <span
                  className={`text-[10px] md:text-sm ${isActive ? ' font-bold' : 'text-gray-300'
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
