import React, { useEffect, useRef, useState } from "react";
import { FaEye } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { BiPlus } from "react-icons/bi";


import {
  VendorAddressesApi,
  getVendorAddressesApi,
  getVendorProfileApi,
  updateVendorAddressApi,
  updateVendorProfileApi,
} from "../../services/allAPI";
import { add, format } from "date-fns";
import { toast } from "react-toastify";

const VendorProfile = () => {
  const [profileData, setProfileData] = useState({});
  const [addresses, setAddresses] = useState({}); // ✅ NEW STATE
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [replaceField, setReplaceField] = useState(null);

  const fileInputRef = useRef(null);
  const server_url = "http://localhost:8000";
const [addressForm, setAddressForm] = useState({
  line1: "",
  line2: "",
  city: "",
  postal_code: "",
  state: "",
  country: ""
});
const [editAddressId, setEditAddressId] = useState(null);


  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);

const handleAddClick = () => {
  setAddressForm({
    line1: "",
    line2: "",
    landmark: "",
    postal_code: "",
    state: "",
    country: ""
  }); // reset form with all required fields
  setIsAddAddressModalOpen(true);
};


const handleSaveAddress = async () => {
  try {
    const res = await VendorAddressesApi({
      ...addressForm,
      vendor: profileData.id
    });
    console.log(res);
    setIsAddAddressModalOpen(false);
    await fetchVendorAddress();
  } catch (error) {
    console.error("Error saving address:", error);
  }
};



  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Fetch profile data
        const profile = await getVendorProfileApi();
        setProfileData(profile);

        // ✅ Fetch addresses
        const addressesList = await getVendorAddressesApi();
  setAddresses(addressesList.length > 0 ? addressesList[0] : {}); // store first address object

        console.log("Profile Data:", profile);
        console.log("Addresses:", addressesList);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };

    fetchData();
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
        city: profileData.city || "",
      });
    } else if (section === "contact") {
      setEditForm({
        contact_name: profileData.contact_name || "",
        contact_email: profileData.contact_email || "",
        contact_number: profileData.contact_number || "",
        designation: profileData.designation || "",
      });
    }
else if (section === "address") {
  // ✅ Store the address ID
  setEditAddressId(addresses.id);

  // ✅ Set the form fields
  setEditForm({
    line1: addresses.line1 || "",
    line2: addresses.line2 || "",
    city: addresses.city || "",
    postal_code: addresses.postal_code || "",
    state: addresses.state || "",
    country: addresses.country || ""
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
    // make sure you get the correct address id from state
    // const addressId = addresses?.id || addresses[0]?.id; // works if it's an object or array
    // if (!addressId) {
    //   toast.error("No address ID found");
    //   return;
    // }

    const response = await updateVendorProfileApi( editForm);
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
const handleAdressSubmitEdit = async () => {
  try {
   const res=  await updateVendorAddressApi(editAddressId, editForm);
console.log("Address updated successfully:", res);

    toast.success("Address updated successfully!");
    setIsEditModalOpen(false);
setAddresses(prev => ({ ...prev, ...editForm }));

  } catch (error) {
    console.error(error);
    toast.error("Failed to update address");
  }
};



  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && replaceField) {
      const updatedProfileData = { ...profileData };
      const timestamp = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
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

      {/* Business & Location Details */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
  {/* Business Details */}
  <div className="bg-white rounded-lg px-5 py-6 shadow">
    <div className="flex justify-between items-center flex-wrap gap-2">
      <h2 className="font-semibold text-lg">Business Details</h2>
      <FiEdit3
        size={20}
        onClick={() => handleEditClick("business")}
        className="cursor-pointer"
      />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 mt-4">
      <p className="font-semibold">Name</p>
      <p>{profileData.company_name || ""}</p>
      <p className="font-semibold">Email</p>
      <p>{profileData.company_email || ""}</p>
      <p className="font-semibold">Phone</p>
      <p>{profileData.company_number || ""}</p>
      <p className="font-semibold">GSTIN</p>
      <p>{profileData.company_gstin || ""}</p>
    </div>
  </div>

  {/* Location Details */}
  <div className="bg-white rounded-lg px-5 py-6 shadow">
    <div className="flex justify-between items-center flex-wrap gap-2">
      <h2 className="font-semibold text-lg">Location Details</h2>
      <FiEdit3
        size={20}
        onClick={() => handleEditClick("location")}
        className="cursor-pointer"
      />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-y-2">
      <p className="font-semibold">Pick Up Location</p>
      <div className="space-y-2">
        <p>ABC Technologies Edathala, Kakkanad - Kochi</p>
        <p>Near Pulliparambu Kaavu Temple</p>
        <button className="text-[#5737B4] mt-2 text-md">
          Use My Current Location
        </button>
      </div>
    </div>
  </div>
</div>

{/* Contact & Address Details */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
  
  {/* Contact Details */}
  <div className="bg-white rounded-lg px-5 py-6 shadow">
    <div className="flex justify-between items-center flex-wrap gap-2">
      <h2 className="font-semibold text-lg">Contact Details</h2>
      <FiEdit3
        size={20}
        onClick={() => handleEditClick("contact")}
        className="cursor-pointer"
      />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 mt-4">
      <p className="font-semibold">Contact Name</p>
      <p>{profileData.contact_name || ""}</p>
      <p className="font-semibold">Contact Email</p>
      <p>{profileData.contact_email || ""}</p>
      <p className="font-semibold">Contact Number</p>
      <p>{profileData.contact_number || ""}</p>
      <p className="font-semibold">Designation</p>
      <p>{profileData.designation || ""}</p>
    </div>
  </div>

  {/* Address Details */}
<div className="bg-white rounded-lg px-5 py-6 shadow">
  <div className="flex justify-between items-center flex-wrap gap-2">
    <h2 className="font-semibold text-lg">Address Details</h2>
    {addresses?.line1 ? (
      <FiEdit3
        size={20}
        onClick={() => handleEditClick("address")}
        className="cursor-pointer"
      />
    ) : (
      <BiPlus
        size={25}
        onClick={handleAddClick}
        className="cursor-pointer"
      />
    )}
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 mt-4">
    <p className="font-semibold">Line 1</p>
    <p>{addresses?.line1 || "NA"}</p>

    <p className="font-semibold">Line 2</p>
    <p>{addresses?.line2 || "NA"}</p>

    <p className="font-semibold">City</p>
    <p>{addresses?.city || "NA"}</p>

    <p className="font-semibold">State</p>
    <p>{addresses?.state || "NA"}</p>

    <p className="font-semibold">Pincode</p>
    <p>{addresses?.postal_code || "NA"}</p>

    <p className="font-semibold">Country</p>
    <p>{addresses?.country || "NA"}</p>
  </div>
</div>



</div>

{/* KYC Uploads */}
<div className="mt-6">
  <h2 className="font-semibold text-lg mb-3">KYC Uploads</h2>
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded shadow gap-4">
      <p className="text-green-600 font-medium">✓ Verified</p>
      <p className="font-medium">PAN Card</p>
      <a
        href={`${server_url}${profileData.pan_card}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 text-sm underline cursor-pointer"
      >
        PANCard.pdf
      </a>
      {profileData?.submitted_at && (
        <div className="text-sm text-gray-700">
          <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
          {format(
            new Date(profileData.submitted_at),
            "dd MMMM yyyy, 'Time:' h:mm a"
          )}
        </div>
      )}
      <div
        onClick={() => {
          setReplaceField("pan_card");
          fileInputRef.current.click();
        }}
        className="text-[#5737B4] cursor-pointer text-md"
      >
        Replace Document
      </div>

      <div className="flex gap-5">
        <div
          onClick={() =>
            window.open(`${server_url}${profileData.pan_card}`, "_blank")
          }
          className="cursor-pointer"
        >
          <FaEye size={22} />
        </div>
        <div>
          <RiDeleteBinLine size={22} />
        </div>
      </div>
    </div>
  

          <div className="flex justify-between items-center bg-white p-5 rounded shadow sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className=" font-medium">
              Passport <br /> / Aadhaar / License
            </span>
            <a
              href={`${server_url}${profileData.aadhar_passport_dl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              Aadhar/Passport/DL
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("aadhar_passport_dl");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(
                    `${server_url}${profileData.aadhar_passport_dl}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
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
            <span className="font-medium">GSTIN Certificate</span>
            <a
              href={`${server_url}${profileData.gst_certificate}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              gstcertificate
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("gst_certificate");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(
                    `${server_url}${profileData.gst_certificate}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className="w-30 font-medium">Business Registration</span>
            <a
              href={`${server_url}${profileData.business_registration_cert}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              Business Reg Certificate
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("business_registration_cert");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(
                    `${server_url}${profileData.business_registration_cert}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className="font-medium">
              Shop &Establishment <br /> License
            </span>
            <a
              href={`${server_url}${profileData.shop_license}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              Shop License
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("shop_license");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(
                    `${server_url}${profileData.shop_license}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
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
            <span className=" font-medium">Cancelled Cheque</span>
            <a
              href={`${server_url}${profileData.cancelled_cheque}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              CancelledCheque
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("cancelled_cheque");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(
                    `${server_url}${profileData.cancelled_cheque}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className="font-medium">
              Bank Passbook <br /> / Statement
            </span>
            <a
              href={`${server_url}${profileData.bank_statement}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              Bank Statement
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("bank_statement");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(
                    `${server_url}${profileData.bank_statement}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
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
            <span className="font-medium">IT Return</span>
            <a
              href={`${server_url}${profileData.it_return}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              IT Return
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("it_return");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(`${server_url}${profileData.it_return}`, "_blank")
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className=" font-medium">
              P&L Statement/
              <br />
              Balance Sheet
            </span>
            <a
              href={`${server_url}${profileData.financial_statement}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              Financial Statement
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("financial_statement");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(
                    `${server_url}${profileData.financial_statement}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* agreements & Supporting */}
      <div className=" mt-6">
        <h2 className="font-semibold text-lg mb-3">
          Agreements & Supporting Documents{" "}
        </h2>
        <div className="space-y-4">
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-yellow-600 font-medium">⏳Pending</p>
            <span className=" font-medium ">
              Filled Vendor <br />
              Registration Form
            </span>
            <a
              href={`${server_url}${profileData.vendor_registration_form}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              Registration Form
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("vendor_registration_form");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(
                    `${server_url}${profileData.vendor_registration_form}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className="md:w-60 sm:w-30 font-medium">
              Signed NPA/Supply Agreement/Terms and Condition
            </span>
            <a
              href={`${server_url}${profileData.signed_terms_and_con}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              Signed Agreement
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("signed_terms_and_con");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(
                    `${server_url}${profileData.signed_terms_and_con}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className="w-60 font-medium">
              Authorization Letter/ Dealership Certificate/{" "}
            </span>
            <a
              href={`${server_url}${profileData.dealership_letter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              Dealership Certificate
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("dealership_letter");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(
                    `${server_url}${profileData.dealership_letter}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className="w-60 font-medium">
              Authorized Signatory Letter{" "}
            </span>
            <a
              href={`${server_url}${profileData.authorized_signatory_letter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline cursor-pointer"
            >
              Signatory Letter
            </a>
            {profileData?.submitted_at && (
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                {format(
                  new Date(profileData.submitted_at),
                  "dd MMMM yyyy, 'Time:' h:mm a"
                )}
              </div>
            )}
            <div
              onClick={() => {
                setReplaceField("authorized_signatory_letter");
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md"
            >
              Replace Document
            </div>

            <div className="flex gap-5">
              <div
                onClick={() =>
                  window.open(
                    `${server_url}${profileData.authorized_signatory_letter}`,
                    "_blank"
                  )
                }
                className="cursor-pointer"
              >
                <FaEye size={22} />
              </div>
              <div>
                <RiDeleteBinLine size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-10">
        <button className="border border-[#5737B4] text-[#5737B4] px-16 py-2 rounded-md text-sm font-medium hover:bg-[#f1edff] transition">
          Cancel
        </button>
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
              Edit{" "}
              {editSection === "business"
                ? "Business Details"
                : editSection === "location"
                ? "Location Details"
                : editSection === "Contact Details"
                ? "Contact Details"
                : "Address Details"}
            </h2>

            <div className="flex flex-col gap-4">
              {editSection === "business" && (
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

              {editSection === "location" && (
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
                    name="city"
                    placeholder="Nearby city"
                    value={editForm.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-md"
                  />
                </>
              )}

              {editSection === "contact" && (
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

            {editSection === "address" && (
  <>
    <input
      type="text"
      name="line1"
      placeholder="Line 1"
      value={editForm.line1}
      onChange={handleChange}
      className="w-full px-4 py-3 border rounded-md"
    />
    <input
      type="text"
      name="line2"
      placeholder="Line 2"
      value={editForm.line2}
      onChange={handleChange}
      className="w-full px-4 py-3 border rounded-md"
    />
    <input
      type="text"
      name="city"
      placeholder="City"
      value={editForm.city}
      onChange={handleChange}
      className="w-full px-4 py-3 border rounded-md"
    />
    <input
      type="text"
      name="state"
      placeholder="State"
      value={editForm.state}
      onChange={handleChange}
      className="w-full px-4 py-3 border rounded-md"
    />
    <input
      type="text"
      name="postal_code"
      placeholder="Pincode"
      value={editForm.postal_code}
      onChange={handleChange}
      className="w-full px-4 py-3 border rounded-md"
    />
    <input
      type="text"
      name="country"
      placeholder="Country"
      value={editForm.country}
      onChange={handleChange}
      className="w-full px-4 py-3 border rounded-md"
    />
  </>
)}

            </div>

            <div className="mt-6 text-right">
              <button
  onClick={
    editSection === "address"
      ? handleAdressSubmitEdit
      : handleSubmitEdit
  }
  className="px-6 py-2 bg-[#5737B4] hover:bg-[#402b91] text-white rounded-md text-sm font-semibold"
>
  Save Changes
</button>

            </div>
          </div>
        </div>
      )}
      {isAddAddressModalOpen && (
<div
  className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
  onClick={() => setIsAddAddressModalOpen(false)}
>
  <div
    className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg"
    onClick={(e) => e.stopPropagation()} // prevent close on inside click
  >
    <h2 className="text-xl font-semibold mb-4">Add Address</h2>

    {/* Line 1 */}
    <input
      type="text"
      placeholder="Line 1"
      value={addressForm.line1}
      onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
      className="border p-2 w-full rounded mb-2"
    />

    {/* Line 2 */}
    <input
      type="text"
      placeholder="Line 2"
      value={addressForm.line2}
      onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
      className="border p-2 w-full rounded mb-2"
    />

    {/* city */}
    <input
      type="text"
      placeholder="city"
      value={addressForm.city}
      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
      className="border p-2 w-full rounded mb-2"
    />

    {/* Pincode */}
    <input
      type="text"
      placeholder="Pincode"
      value={addressForm.postal_code}
      onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
      className="border p-2 w-full rounded mb-2"
    />

    {/* State */}
    <input
      type="text"
      placeholder="State"
      value={addressForm.state}
      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
      className="border p-2 w-full rounded mb-2"
    />

    {/* Country */}
    <input
      type="text"
      placeholder="Country"
      value={addressForm.country}
      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
      className="border p-2 w-full rounded mb-4"
    />

    {/* Buttons */}
    <div className="flex justify-end gap-2">
      <button
        onClick={() => setIsAddAddressModalOpen(false)}
        className="bg-gray-300 px-4 py-2 rounded"
      >
        Cancel
      </button>
      <button
        onClick={handleSaveAddress}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save
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
