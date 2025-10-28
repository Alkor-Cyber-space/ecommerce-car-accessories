import React, { useEffect, useRef, useState } from "react";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import { FaEye } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { BiPlus } from "react-icons/bi";
import {
  VendorAddressesApi,
  getVendorAddressesApi,
  getVendorKycDocuments,
  getVendorProfileApi,
  updateKycDocuments,
  updateVendorAddressApi,
  updateVendorProfileApi,
} from "../../services/allAPI";
import { add, format } from "date-fns";
import { toast } from "react-toastify";
import DocumentCard from "../../components/vendor/DocumentCard";

const documentGroups = {
  kyc: [
    { key: "pan_card", label: "PAN Card" },
    { key: "aadhar_passport_dl", label: "Passport / Aadhaar / DL" },
  ],
  business: [
    { key: "gst_certificate", label: "GSTIN Certificate" },
    { key: "business_registration_cert", label: "Business Registration" },
    { key: "shop_license", label: "Shop License" },
  ],
  bank: [
    { key: "cancelled_cheque", label: "Cancelled Cheque" },
    { key: "bank_statement", label: "Bank Statement" },
  ],
  financial: [
    { key: "it_return", label: "IT Return" },
    { key: "financial_statement", label: "Financial Statement" },
  ],
  agreements: [
    { key: "vendor_registration_form", label: "Vendor Registration Form" },
    { key: "signed_terms_and_con", label: "Signed Agreement" },
    { key: "dealership_letter", label: "Dealership Certificate" },
    {
      key: "authorized_signatory_letter",
      label: "Authorized Signatory Letter",
    },
  ],
};

const VendorProfile = () => {
  const [profileData, setProfileData] = useState({});
  const [addresses, setAddresses] = useState({});
  const [kycDocuments, setKycDocuments] = useState({});
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
    country: "",
  });
  const [editAddressId, setEditAddressId] = useState(null);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [addressErrors, setAddressErrors] = useState({
    postal_code: "",
    country: "",
  });

  // Validation functions
  const validateAddressForm = (form) => {
    let newErrors = {};
    let isValid = true;

    if (!form.postal_code || !/^\d{6}$/.test(form.postal_code)) {
      newErrors.postal_code = "Pincode must be exactly 6 digits.";
      isValid = false;
    }

    if (!form.country) {
      newErrors.country = "Please select a country.";
      isValid = false;
    }

    setAddressErrors(newErrors);
    return isValid;
  };

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (addressErrors[name]) {
      setAddressErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const selectAddressCountry = (val) => {
    setAddressForm((prev) => ({
      ...prev,
      country: val,
      state: "",
    }));
    if (addressErrors.country) {
      setAddressErrors((prev) => ({ ...prev, country: "" }));
    }
  };

  const selectAddressRegion = (val) => {
    setAddressForm((prev) => ({
      ...prev,
      state: val,
    }));
  };

  const handleAddClick = () => {
    setAddressForm({
      line1: "",
      line2: "",
      landmark: "",
      postal_code: "",
      state: "",
      country: "",
    });
    setIsAddAddressModalOpen(true);
  };
  const [errors, setErrors] = useState({
    postal_code: "",
    country: "",
  });

  const handleSaveAddress = async () => {
    if (!validateAddressForm(addressForm)) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      const res = await VendorAddressesApi({
        ...addressForm,
        vendor: profileData.id,
      });

      // Update the addresses state immediately
      setAddresses(res);
      toast.success("Address saved successfully!");
      setIsAddAddressModalOpen(false);

      // Optionally fetch updated data from server
      await fetchVendorAddress();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(error.response?.data?.message || "Error saving address");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile data
        const profile = await getVendorProfileApi();
        setProfileData(profile);

        //  Fetch addresses
        const addressesList = await getVendorAddressesApi();
        setAddresses(addressesList.length > 0 ? addressesList[0] : {});

        //  Fetch KYC documents
        if (profile?.user) {
          const kycDocs = await getVendorKycDocuments(profile.user);
          setKycDocuments(kycDocs);
          console.log("KYC Documents:", kycDocs);
        } else {
          console.warn("Vendor ID not found in profile");
        }

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
    } else if (section === "address") {
      setEditAddressId(addresses.id);

      setEditForm({
        line1: addresses.line1 || "",
        line2: addresses.line2 || "",
        city: addresses.city || "",
        postal_code: addresses.postal_code || "",
        state: addresses.state || "",
        country: addresses.country || "",
      });
    }
  };

  // Validation functions
  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(number);
  };

  const validatePincode = (pincode) => {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
  };

  const selectCountry = (val) => {
    setEditForm((current) => ({
      ...current,
      country: val,
      state: "",
      city: "",
    }));
  };

  const selectRegion = (val) => {
    setEditForm((current) => ({
      ...current,
      state: val,
    }));
  };

  const validateCountry = (country) => {
    return country && country.length > 0;
  };

  // ✅ Validate input fields
const isFormValid = (form) => {
  switch (editSection) {
    case "business":
      return (
        form.company_name?.trim() &&
        validateEmail(form.company_email) &&
        validatePhone(form.company_number)
      );

    case "contact":
      return (
        form.contact_name?.trim() &&
        validateEmail(form.contact_email) &&
        validatePhone(form.contact_number) &&
        form.designation?.trim()
      );

    case "location":
      return form.pickup_location?.trim() && form.city?.trim();

    case "address":
      return (
        form.line1?.trim() &&
        form.country?.trim() &&
        form.state?.trim() &&
        form.city?.trim() &&
        form.postal_code?.trim()
      );

    default:
      return false;
  }
};

const validateEmail = (email) => {
  if (typeof email !== "string") return false;
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return gmailRegex.test(email.trim());
};

const validatePhone = (phone) => {
  if (typeof phone !== "string" && typeof phone !== "number") return false;
  const phoneStr = String(phone).trim();
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phoneStr);
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...editForm, [name]: value };
    setEditForm(updatedForm);

    setEditForm(updatedForm);

    let newErrors = { ...errors };

    if (name === "postal_code") {
      if (!validatePincode(value)) {
        newErrors.postal_code = "Pincode must be exactly 6 digits.";
      } else {
        newErrors.postal_code = "";
      }
    }

    if (name === "country") {
      if (!validateCountry(value)) {
        newErrors.country = "Please enter a valid country name.";
      } else {
        newErrors.country = "";
      }
    }

    setErrors(newErrors);
  };

  const handleSubmitEdit = async () => {
    try {
      if (!isFormValid(editForm)) {
        if (
          editSection === "business" &&
          editForm.company_number &&
          !validatePhoneNumber(editForm.company_number)
        ) {
          toast.error("Company phone number must be exactly 10 digits");
        }
        if (
          editSection === "contact" &&
          editForm.contact_number &&
          !validatePhoneNumber(editForm.contact_number)
        ) {
          toast.error("Contact phone number must be exactly 10 digits");
        }
        if (editSection === "address") {
          if (editForm.postal_code && !validatePincode(editForm.postal_code)) {
            toast.error("Pincode must be exactly 6 digits");
          }
          if (editForm.country && !validateCountry(editForm.country)) {
            toast.error("Please enter a valid country name");
          }
        }
        return;
      }

      const response = await updateVendorProfileApi(editForm);
      console.log("Profile updated successfully:", response);

      toast.success("Profile updated successfully!");
      setProfileData((prev) => ({
        ...prev,
        ...editForm,
      }));

      setIsEditModalOpen(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while updating profile";
      toast.error(errorMessage);
    }
  };

  const handleAdressSubmitEdit = async () => {
    if (!isFormValid(editForm)) {
      if (!validatePincode(editForm.postal_code)) {
        toast.error("Please enter a valid 6-digit pincode.");
      }
      if (!validateCountry(editForm.country)) {
        toast.error("Please enter a valid country name.");
      }
      return; 
    }

    try {
      const res = await updateVendorAddressApi(editAddressId, editForm);
      toast.success("Address updated successfully!");
      setIsEditModalOpen(false);
      setAddresses((prev) => ({ ...prev, ...editForm }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to update address");
    }
  };

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const vendorId = profileData?.user;

    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPG, and PNG files are allowed.");
      return;
    }
    if (file.size > maxFileSize) {
      alert("File size must be less than 5MB.");
      return;
    }
    if (replaceField) {
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
      // updatedProfileData.submitted_at = timestamp;
      setProfileData(updatedProfileData);
      setReplaceField(null);
      console.log(`📂 Replaced: ${replaceField} →`, file.name);
      console.log("🕒 Uploaded At:", timestamp);
      const formData = new FormData();
      formData.append(replaceField, file);
      // formData.append("submitted_at", new Date().toISOString());
      try {
        const response = await updateKycDocuments(vendorId, formData);
        console.log(" Document uploaded successfully:", response);
        toast.success("Updated!!");
        const updatedKycDocs = await getVendorKycDocuments(vendorId);
        setKycDocuments(updatedKycDocs);
      } catch (error) {
        console.error(" Upload failed:", error);
        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="bg-gray-100 px-8 py-10 rounded-2xl min-h-screen">
      <h1 className="text-2xl text-[#5737B4] font-semibold">Profile & KYC</h1>
      <p className="my-1">Manage your business details and documents.</p>

      {/* Contact & Address Details */}
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
          </div>
        </div>

        {/* Address Details - moved top-right */}
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

      {/* Contact Details - stays in the second row */}
      <div className="grid grid-cols-1 gap-4 mt-6">
        <div className="bg-white rounded-lg px-5 py-6 shadow w-80 sm:w-[550px]">
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
      </div>

      <div className="mt-6">
        {Object.entries(documentGroups).map(([groupKey, docs]) => (
          <div key={groupKey} className="mb-6">
            <h2 className="font-semibold text-lg mb-3 capitalize">
              {groupKey} Uploads
            </h2>
            <div className="space-y-4">
              {docs.map((doc) => (
                <DocumentCard
                  key={doc.key}
                  docKey={doc.key}
                  label={doc.label}
                  profileData={kycDocuments}
                  server_url={server_url}
                  setReplaceField={setReplaceField}
                  fileInputRef={fileInputRef}
                />
              ))}
            </div>
          </div>
        ))}
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
                  {!validateEmail(editForm.company_email) &&
                    editForm.company_email && (
                      <p className="text-red-500 text-sm">
                        Enter a valid Gmail address.
                      </p>
                    )}

                  <input
                    type="tel"
                    name="company_number"
                    placeholder="Phone"
                    value={editForm.company_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-md"
                  />
                  {!validatePhone(editForm.company_number) &&
                    editForm.company_number && (
                      <p className="text-red-500 text-sm">
                        Enter a valid 10-digit number.
                      </p>
                    )}
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

                  <CountryDropdown
                    name="country"
                    value={editForm.country || ""}
                    onChange={(val) => selectCountry(val)}
                    className="w-full px-4 py-3 border rounded-md"
                    defaultOptionLabel="Select Country"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.country}
                    </p>
                  )}

                  <RegionDropdown
                    name="state"
                    country={editForm.country}
                    value={editForm.state || ""}
                    onChange={(val) => selectRegion(val)}
                    className="w-full px-4 py-3 border rounded-md"
                    blankOptionLabel="Select State/Region"
                    disabled={!editForm.country}
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
                    name="postal_code"
                    placeholder="Pincode"
                    value={editForm.postal_code}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-md"
                  />
                  {errors.postal_code && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.postal_code}
                    </p>
                  )}
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
                disabled={!isFormValid(editForm)}
                className={`px-6 py-2 ${
                  isFormValid(editForm)
                    ? "bg-[#5737B4] hover:bg-[#402b91]"
                    : "bg-gray-400 cursor-not-allowed"
                } text-white rounded-md text-sm font-semibold transition`}
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
            <h2 className="text-xl font-semibold mb-4">Add Address </h2>

            {/* Line 1 */}
            <input
              type="text"
              name="line1"
              placeholder="Line 1"
              value={addressForm.line1}
              onChange={handleAddressFormChange}
              className="border p-2 w-full rounded mb-2"
              required
            />

            {/* Line 2 */}
            <input
              type="text"
              name="line2"
              placeholder="Line 2"
              value={addressForm.line2}
              onChange={handleAddressFormChange}
              className="border p-2 w-full rounded mb-2"
            />

            {/* Country */}
            <CountryDropdown
              value={addressForm.country}
              onChange={selectAddressCountry}
              className="border p-2 w-full rounded mb-2"
              defaultOptionLabel="Select Country"
            />
            {addressErrors.country && (
              <p className="text-red-500 text-sm mb-2">
                {addressErrors.country}
              </p>
            )}

            {/* State/Region */}
            <RegionDropdown
              country={addressForm.country}
              value={addressForm.state}
              onChange={selectAddressRegion}
              className="border p-2 w-full rounded mb-2"
              blankOptionLabel="Select State/Region"
              disabled={!addressForm.country}
            />

            {/* City */}
            <input
              type="text"
              name="city"
              placeholder="City"
              value={addressForm.city}
              onChange={handleAddressFormChange}
              className="border p-2 w-full rounded mb-2"
              required
            />

            {/* Pincode */}
            <input
              type="text"
              name="postal_code"
              placeholder="Pincode"
              value={addressForm.postal_code}
              onChange={handleAddressFormChange}
              className="border p-2 w-full rounded mb-2"
              required
              maxLength={6}
              pattern="\d{6}"
            />
            {addressErrors.postal_code && (
              <p className="text-red-500 text-sm mb-2">
                {addressErrors.postal_code}
              </p>
            )}

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
