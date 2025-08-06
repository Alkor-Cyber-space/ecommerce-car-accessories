import React, { useEffect, useRef, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from 'react-icons/ri';
import { getVendorProfileApi } from '../../services/allAPI';

const VendorProfile = () => {
 const [profileData , setProfileData] = useState({})
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSection, setEditSection] = useState(null); // 'business' | 'location' | 'bank'

  const fileInputRef = useRef(null);
  // const [fileName, setFileName] = useState('PANfile.pdf');

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



  const handleReplaceDoc = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      // You can update state or dispatch to Redux here
      // setFileName(file.name);

      // Example: Upload API logic here
      // const formData = new FormData();
      // formData.append("document", file);
      // await axios.post("/upload-endpoint", formData);
    }
  };

  // file change , also update time---------------
  //   const fileInputRef = useRef(null);
  const [replaceIndex, setReplaceIndex] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && replaceIndex !== null) {
      const updatedDocs = [...documents];

      const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
      console.log(timestamp);


      // Update the selected document
      updatedDocs[replaceIndex].fileName = file.name;
      updatedDocs[replaceIndex].uploadedAt = timestamp;

      // Update state
      setDocuments(updatedDocs);
      setReplaceIndex(null);

      // Console logs for debugging
      console.log("📄 File Replaced:");
      console.log("→ New File Name:", file.name);
      console.log("→ Updated At:", timestamp);
      console.log("→ Updated Document Entry:", updatedDocs[replaceIndex]);
      console.log("→ Full Documents State:", updatedDocs);
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
              onClick={() => {
                setEditSection('business');
                setIsEditModalOpen(true);
              }}
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
              onClick={() => {
                setEditSection('location');
                setIsEditModalOpen(true);
              }}
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
      {/* Bank Details */}
      <div className="bg-white lg:w-[49.5%] md:w-full rounded-lg px-5 py-6 shadow mt-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Contact Details</h2>
          <FiEdit3 size={20}
            onClick={() => {
              setEditSection('bank');
              setIsEditModalOpen(true);
            }}
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
            <p className='font-medium'>PAN Card</p>
          <a
  href={profileData.pan_card}
  target="_blank"
  rel="noopener noreferrer"
    // download="PANCard.pdf"

  className="text-blue-600 text-sm underline"
>
  PANCard.pdf
</a>

            {/* <span className="underline text-sm text-blue-600 cursor-pointer">PANfile.pdf</span> */}
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div
              onClick={() => fileInputRef.current.click()}
              className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
              <div><RiDeleteBinLine size={22} /></div>
            </div>

          </div>

          <div className="flex justify-between items-center bg-white p-5 rounded shadow sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className=' font-medium'>Passport <br /> / Aadhaar / License</span>
            <span className="underline text-sm text-blue-600 cursor-pointer">PANfile.pdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div
              onClick={() => fileInputRef.current.click()}

              className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
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
            <span className="underline text-sm text-blue-600 cursor-pointer">GSTNCertificatepdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div
              onClick={() => fileInputRef.current.click()}
              className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
              <div><RiDeleteBinLine size={22} /></div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='w-30 font-medium'>Business Registration</span>
            <span className="underline text-sm text-blue-600 cursor-pointer">PANfile.pdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div
              onClick={() => {
                setReplaceIndex();
                fileInputRef.current.click();
              }}
              className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
              <div><RiDeleteBinLine size={22} /></div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='font-medium'>Shop &Establishment <br /> License</span>
            <span className="underline text-sm text-blue-600 cursor-pointer">PANfile.pdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
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
            <span className="underline text-sm text-blue-600 cursor-pointer">GSTNCertificatepdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
              <div><RiDeleteBinLine size={22} /></div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='font-medium'>Bank Passbook <br /> / Statement</span>
            <span className="underline text-sm text-blue-600 cursor-pointer">PANfile.pdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
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
            <span className="underline text-sm text-blue-600 cursor-pointer">PANfile.pdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
              <div><RiDeleteBinLine size={22} /></div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className=' font-medium'>P&L Statement/<br />Balance Sheet</span>
            <span className="underline text-sm text-blue-600 cursor-pointer">PANfile.pdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
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
            <span className="underline text-sm text-blue-600 cursor-pointer">GSTNCertificatepdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
              <div><RiDeleteBinLine size={22} /></div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='md:w-60 sm:w-30 font-medium'>Signed NPA/Supply Agreement/Terms and Condition</span>
            <span className="underline text-sm text-blue-600 cursor-pointer">PANfile.pdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
              <div><RiDeleteBinLine size={22} /></div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='w-60 font-medium'>Authorization Letter/ Dealership Certificate/ </span>
            <span className="underline text-sm text-blue-600 cursor-pointer">PANfile.pdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
              <div><RiDeleteBinLine size={22} /></div>
            </div>
          </div>
          <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            <p className="text-green-600 font-medium">✓ Verified</p>
            <span className='w-60 font-medium'>Authorized Signatory Letter  </span>
            <span className="underline text-sm text-blue-600 cursor-pointer">PANfile.pdf</span>
            <p className="text-sm text-gray-700"><span className='font-medium text-gray-900'>Uploaded At :</span> 20 May 2025, Time:3:20 PM</p>
            <div className="text-[#5737B4] cursor-pointer text-md">Replace Document</div>
            <div className='flex gap-5'>
              <div><FaEye size={22} /></div>
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
        accept=".pdf,.jpg,.jpeg,.png"
        ref={fileInputRef}
        className="hidden"
        onChange={handleReplaceDoc}
      />

      {/* modal */}
{isEditModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm px-4">
    <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8">
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        onClick={() => setIsEditModalOpen(false)}
      >
        ✕
      </button>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-[#5737B4] mb-6 border-b pb-3">
        Edit {editSection === 'business'
          ? 'Business Details'
          : editSection === 'location'
            ? 'Location Details'
            : 'Bank Details'}
      </h2>

      {/* Form Section */}
      <div className="flex flex-col gap-4">
        {editSection === 'business' && (
          <>
            <input type="text" placeholder="Name" 
            value={profileData.company_name}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1  transition" />
            <input type="email" placeholder="Email"
                        value={profileData.company_email}

             className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1  transition" />
            <input type="tel" placeholder="Phone"
                        value={profileData.company_number}

             className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1  transition" />
            <input type="text" placeholder="GSTIN"
                       

             className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1  transition" />
          </>
        )}

        {editSection === 'location' && (
          <>
            <input type="text" placeholder="Pick Up Location" 
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1  transition"/>
            <input type="text" placeholder="Nearby Landmark"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1  transition" />
          </>
        )}

        {editSection === 'bank' && (
          <>
            <input type="text" placeholder="Account Number" 
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1  transition"/>
            <input type="text" placeholder="Bank Name" 
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1  transition" />
            <input type="text" placeholder="IFSC" 
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1  transition" />
            <input type="text" placeholder="UPI" 
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1  transition" />
          </>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-6 text-right">
        <button
          onClick={() => setIsEditModalOpen(false)}
          className="px-6 py-2 bg-[#5737B4] hover:bg-[#402b91] text-white rounded-md text-sm font-semibold transition"
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
      

