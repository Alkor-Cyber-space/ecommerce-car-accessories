import React from 'react'
import { SlCloudUpload } from 'react-icons/sl'

const Taxdetails = () => {
    return (
        <div>
            <h2 className="text-4xl font-semibold mb-6">Tax / Financial Records</h2>
            <div className='flex flex-row gap-6 '>
                <div className='mt-10 w-[300px]'>
                    <p className='w-50'>cancelled cheque</p>
                    <div className='border-2 border-dashed p-4 text-center'>
                        <div className='flex flex-col items-center justify-center gap-2'>
                            <SlCloudUpload className="text-4xl mb-2 " />

                        </div>
                        <div className='flex flex-col gap-3'>
                            <span className="text-sm text-gray-500">Drag and drop here</span>
                            <span className="text-[#5737B4] font-semibold">Browse Files</span>

                        </div>                        
                        <input
                            type="file"
                            accept=".pdf,.jpeg,.jpg,.png"
                            onChange={(e) => handleFileChange(e, section, id)}
                            className="hidden"
                        />
                    </div>

                </div>
                <div className='w-[300px] mt-4'>
                    <p className='w-75'>P&L Statement or Balance Sheet (Optional for Small Vendors)</p >
                    <div className='border-2 border-dashed p-4 text-center'>
                        <div className='flex flex-col items-center justify-center gap-2'>
                            <SlCloudUpload className="text-4xl mb-2 " />

                        </div>
                        <div className='flex flex-col gap-3'>
                            <span className="text-sm text-gray-500">Drag and drop here</span>
                            <span className="text-[#5737B4] font-semibold">Browse Files</span>

                        </div>                        
                        <input
                            type="file"
                            accept=".pdf,.jpeg,.jpg,.png"
                            onChange={(e) => handleFileChange(e, section, id)}
                            className="hidden"
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Taxdetails