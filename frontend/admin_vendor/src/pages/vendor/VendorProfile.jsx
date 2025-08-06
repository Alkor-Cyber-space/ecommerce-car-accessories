import React, { useEffect, useRef, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from 'react-icons/ri';
import { getVendorProfileApi, updateVendorProfileApi } from '../../services/allAPI';
import { format } from "date-fns";
import { toast } from 'react-toastify';

const VendorProfile = () => {
 const [profileData , setProfileData] = useState({})
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [replaceField, setReplaceField] = useState(null);

  const fileInputRef = useRef(null);
  const server_url= "http://localhost:8000";

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getVendorProfileApi();
        setProfileData(data);
        console.log(data);
        
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

const [editForm, setEditForm] = useState({});

const handleEditClick = (section) => {
  setEditSection(section);
  setIsEditModalOpen(true);

  if (section === "business") {
    setEditForm({
      company_name: profileData.company_name || "",
      company_email: profileData.company_email || "",
      company_number: profileData.company_number || "",
      gstin: profileData.gstin || "",
    });
  } else if (section === "location") {
    setEditForm({
      pickup_location: profileData.pickup_location || "",
      landmark: profileData.landmark || "",
    });
  } else if (section === "contact") {
    setEditForm({
      contact_name: profileData.contact_name || "",
      contact_email: profileData.contact_email || "",
      contact_number: profileData.contact_number || "",
      designation: profileData.designation || "",
    });
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;
  setEditForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleSubmitEdit = async () => {
  try {
    const response = await updateVendorProfileApi(editForm);
    console.log("Profile updated successfully:", response);
    
    toast.success("Profile updated successfully!");
    setProfileData((prev) => ({
      ...prev,
      ...editForm,
    }));

    setIsEditModalOpen(false);
  } catch (error) {
    toast.error(error);
  }
};

const handleFileChange = (e) => {
  const file = e.target.files[0];

  if (file && replaceField) {
    const updatedProfileData = { ...profileData };
    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    updatedProfileData[replaceField] = URL.createObjectURL(file); 
    updatedProfileData.submitted_at = timestamp;

    setProfileData(updatedProfileData);
    setReplaceField(null);

    console.log(`📂 Replaced: ${replaceField} →`, file.name);
    console.log("🕒 Uploaded At:", timestamp);
  }
};

  return (
    <div className="bg-[#ECECF0] px-8 py-10 rounded-2xl min-h-screen">
      <h1 className="text-2xl text-[#5737B4] font-semibold">Profile & KYC</h1>
      <p className="my-1">Manage your business details and documents.</p>

      {/* Business Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-lg px-5 py-6 shadow">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Business Details</h2>
            <FiEdit3 size={20}
                      onClick={() => handleEditClick("business")}
              className="cursor-pointer" />
          </div>
          <div className="grid grid-cols-2 gap-y-5 mt-4">
            <p className="font-semibold">Name</p>
            <p>{profileData.company_name || ''}</p>
            <p className="font-semibold">Email</p>
            <p>{profileData.company_email || ''}</p>
            <p className="font-semibold">Phone</p>
            <p>{profileData.company_number || ''}</p>
            <p className="font-semibold">GSTIN</p>
            <p>{profileData.company_gstin || ''}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg px-5 py-6  shadow">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Location Details</h2>
            <FiEdit3 size={20}
              onClick={() => handleEditClick("location")}
              className="cursor-pointer" />
          </div>
          <div className=" grid grid-cols-2 mt-4 space-y-1">
            <p className="font-semibold">Pick Up Location</p>
            <div className='space-y-2'>
              <p>ABC Technologies Edathala, Kakkanad - Kochi</p>
              <p>Near Pulliparambu Kaavu Temple</p>
              <button className="text-[#5737B4] mt-2 text-md ">
                Use My Current Location
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* contact Details */}
      <div className="bg-white lg:w-[49.5%] md:w-full rounded-lg px-5 py-6 shadow mt-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Contact Details</h2>
          <FiEdit3 size={20}
           onClick={() => handleEditClick("contact")}
            className="cursor-pointer" />
        </div>
        <div className="grid grid-cols-2 gap-y-5 mt-4">
          <p className="font-semibold">Contact Name</p>
          <p>{profileData.contact_name || ''}</p>
          <p className="font-semibold">Contact Email</p>
          <p>{profileData.contact_email}</p>
          <p className="font-semibold">Contact Number</p>
          <p>{profileData.contact_number}</p>
          <p className="font-semibold">Designation</p>
          <p>{profileData.designation}</p>
        </div>
      </div>
      {/* KYC Uploads */}
      <div className="mt-6">
        <h2 className="font-semibold text-lg mb-3">KYC Uploads</h2>
        <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-5 rounded shadow sm:gap-5">
           <p className="text-green-600 font-medium">✓ Verified</p>
           <p className="font-medium">PAN Card</p>
           <a
            href={`${server_url}${profileData.pan_card}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              PANCard.pdf</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("pan_card"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.pan_card}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
       </div>

          <div className="flex justify-between items-center bg-white p-5 rounded shadow sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className=' font-medium'>Passport <br /> / Aadhaar / License</span>
             <a
            href={`${server_url}${profileData.aadhar_passport_dl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              Aadhar/Passport/DL</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("aadhar_passport_dl"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.aadhar_passport_dl}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          </div>
        </div>
      </div>
      {/* Business Documents */}
      <div className=" mt-6">
        <h2 className="font-semibold text-lg mb-3">Business Documents</h2>
        <div className="space-y-4">
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-yellow-600 font-medium">⏳Pending</p>
            <span className='font-medium'>GSTIN Certificate</span>
             <a
            href={`${server_url}${profileData.gst_certificate}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              gstcertificate</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("gst_certificate"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.gst_certificate}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='w-30 font-medium'>Business Registration</span>
             <a
            href={`${server_url}${profileData.business_registration_cert}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              Business Reg Certificate</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("business_registration_cert"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.business_registration_cert}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='font-medium'>Shop &Establishment <br /> License</span>
              <a
            href={`${server_url}${profileData.shop_license}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              Shop License</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("shop_license"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.shop_license}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          </div>
        </div>
      </div>
      {/* Bank % tax DEtails */}
      <div className=" mt-6">
        <h2 className="font-semibold text-lg mb-3">Bank & Tax Details</h2>
        <div className="space-y-4">
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-yellow-600 font-medium">⏳Pending</p>
            <span className=' font-medium'>Cancelled Cheque</span>
           <a
            href={`${server_url}${profileData.cancelled_cheque}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              CancelledCheque</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("cancelled_cheque"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.cancelled_cheque}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='font-medium'>Bank Passbook <br /> / Statement</span>
            <a
            href={`${server_url}${profileData.bank_statement}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              Bank Statement</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("bank_statement"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.bank_statement}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          </div>

        </div>
      </div>
      {/* Tax Financial Records */}
      <div className=" mt-6">
        <h2 className="font-semibold text-lg mb-3">Tax Financial Records</h2>
        <div className="space-y-4">
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='font-medium'>IT Return</span>
            <a
            href={`${server_url}${profileData.it_return}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              IT Return</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("it_return"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.it_return}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className=' font-medium'>P&L Statement/<br />Balance Sheet</span>
             <a
            href={`${server_url}${profileData.financial_statement}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              Financial Statement</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("financial_statement"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.financial_statement}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          </div>
        </div>
      </div>
      {/* agreements & Supporting */}
      <div className=" mt-6">
        <h2 className="font-semibold text-lg mb-3">Agreements & Supporting Documents </h2>
        <div className="space-y-4">
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-yellow-600 font-medium">⏳Pending</p>
            <span className=' font-medium '>Filled Vendor <br />Registration Form</span>
           <a
            href={`${server_url}${profileData.vendor_registration_form}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
               Registration Form</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("vendor_registration_form"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.vendor_registration_form}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='md:w-60 sm:w-30 font-medium'>Signed NPA/Supply Agreement/Terms and Condition</span>
            <a
            href={`${server_url}${profileData.signed_terms_and_con}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              Signed Agreement</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("signed_terms_and_con"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.signed_terms_and_con}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='w-60 font-medium'>Authorization Letter/ Dealership Certificate/ </span>
           <a
            href={`${server_url}${profileData.dealership_letter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              Dealership Certificate</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("dealership_letter"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.dealership_letter}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='w-60 font-medium'>Authorized Signatory Letter  </span>
           <a
            href={`${server_url}${profileData.authorized_signatory_letter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline cursor-pointer">
              Signatory Letter</a>
          {profileData?.submitted_at && (
            <div className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
            {format(new Date(profileData.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
           </div>
          )}
          <div onClick={() => {setReplaceField("authorized_signatory_letter"); fileInputRef.current.click();}} className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>

        <div className="flex gap-5">
          <div onClick={() => window.open(`${server_url}${profileData.authorized_signatory_letter}`, "_blank")} className="cursor-pointer">
           <FaEye size={22} />
           </div>
          <div><RiDeleteBinLine size={22} /></div>
         </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-10">
        <button
          className="border border-[#5737B4] text-[#5737B4] px-16 py-2 rounded-md text-sm font-medium hover:bg-[#f1edff] transition">Cancel</button>
        <button
          className={`px-16 py-2 bg-[#5737B4] rounded-md text-sm text-white font-medium transition`}
        >
          Save
        </button>
      </div>
        <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />


      {/* modal */}
{isEditModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
    <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        onClick={() => setIsEditModalOpen(false)}
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold text-[#5737B4] mb-6 border-b pb-3">
        Edit {editSection === 'business'
          ? 'Business Details'
          : editSection === 'location'
            ? 'Location Details'
            : 'Contact Details'}
      </h2>

      <div className="flex flex-col gap-4">
        {editSection === 'business' && (
          <>
            <input
              type="text"
              name="company_name"
              placeholder="Name"
              value={editForm.company_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md"
            />
            <input
              type="email"
              name="company_email"
              placeholder="Email"
              value={editForm.company_email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md"
            />
            <input
              type="tel"
              name="company_number"
              placeholder="Phone"
              value={editForm.company_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md"
            />
            <input
              type="text"
              name="gstin"
              placeholder="GSTIN"
              value={editForm.gstin}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md"
            />
          </>
        )}

        {editSection === 'location' && (
          <>
            <input
              type="text"
              name="pickup_location"
              placeholder="Pick Up Location"
              value={editForm.pickup_location}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md"
            />
            <input
              type="text"
              name="landmark"
              placeholder="Nearby Landmark"
              value={editForm.landmark}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md"
            />
          </>
        )}

        {editSection === 'contact' && (
          <>
            <input
              type="text"
              name="contact_name"
              placeholder="Contact Name"
              value={editForm.contact_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md"
            />
            <input
              type="email"
              name="contact_email"
              placeholder="Contact Email"
              value={editForm.contact_email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md"
            />
            <input
              type="tel"
              name="contact_number"
              placeholder="Contact Number"
              value={editForm.contact_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md"
            />
            <input
              type="text"
              name="designation"
              placeholder="Designation"
              value={editForm.designation}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md"
            />
          </>
        )}
      </div>

      <div className="mt-6 text-right">
        <button
           onClick={handleSubmitEdit}
          className="px-6 py-2 bg-[#5737B4] hover:bg-[#402b91] text-white rounded-md text-sm font-semibold"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}
    </div>

  );
};


export default VendorProfile;

      // {/* maaped */}
     
      // {documents.map((doc, index) => (
      //   <div key={index} className="flex justify-between items-center bg-white p-5 rounded shadow sm:gap-5">

      //     {/* Status */}
      //     <p className={`font-medium ${doc.status === "verified" ? "text-green-600" :
      //         doc.status === "pending" ? "text-yellow-500" :
      //           "text-red-500"
      //       }`}>
      //       {doc.status === "verified" ? "✓ Verified" :
      //         doc.status === "pending" ? "⌛ Pending" :
      //           "✗ Rejected"}
      //     </p>

      //     {/* Title */}
      //     <p className="font-medium">{doc.title}</p>

      //     {/* File Name */}
      //     <span className="underline text-sm text-blue-600 cursor-pointer">{doc.fileName}</span>

      //     {/* Uploaded Time */}
      //     <p className="text-sm text-gray-700">
      //       <span className='font-medium text-gray-900'>Uploaded At :</span> {doc.uploadedAt}
      //     </p>

      //     {/* Replace Document */}
      //     <div
      //       onClick={() => {
      //         setReplaceIndex(index);
      //         fileInputRef.current.click();
      //       }}
      //       className="text-[#5737B4] cursor-pointer text-md"
      //     >
      //       Replace Document
      //     </div>

      //     {/* Actions */}
      //     <div className='flex gap-4'>
      //       {/* View */}
      //       <div onClick={() => handleViewDoc(doc.fileUrl)} className="cursor-pointer">
      //         <FaEye size={22} />
      //       </div>

      //       {/* Reject */}
      //       <div onClick={() => handleRejectDoc(index)} className="cursor-pointer text-red-600">
      //         <RxCross2 size={22} />
      //       </div>

      //       {/* Delete */}
      //       <div onClick={() => handleDeleteDoc(index)} className="cursor-pointer text-gray-600">
      //         <RiDeleteBinLine size={22} />
      //       </div>
      //     </div>
      //   </div>
      // ))}
      

