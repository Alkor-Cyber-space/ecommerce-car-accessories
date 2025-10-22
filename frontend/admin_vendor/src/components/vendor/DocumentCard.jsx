import { FaEye } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { format } from "date-fns";

const getStatusConfig = (status) => {
    switch (status) {
        case "approved":
            return { label: "✓ Verified", color: "text-green-600" };
        case "pending":
            return { label: "Pending", color: "text-yellow-600" };
        case "rejected":
            return { label: "Rejected", color: "text-red-600" };
        default:
            return { label: "Not Uploaded", color: "text-gray-500" };
    }
};

export default function DocumentCard({
    docKey,
    label,
    profileData,
    server_url,
    setReplaceField,
    fileInputRef,
}) {
    const url = profileData?.[docKey];
    const status = profileData?.[`${docKey}_status`];
    const { label: statusLabel, color } = getStatusConfig(status);

    return (
        <div className="bg-white p-5 shadow rounded flex justify-between items-center sm:gap-5">
            {/* Status */}
            <p className={`${color} font-medium`}>{statusLabel}</p>

            {/* Label */}
            <span className="font-medium w-35">{label}</span>

            {/* File link */}
            {url ? (
                <a
                    href={`${server_url}${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm underline cursor-pointer w-35"
                >
                    {label}
                </a>
            ) : (
                <span className="text-gray-400 text-sm">Not Uploaded</span>
            )}

            {/* Uploaded at */}
            {profileData?.submitted_at && (
                <div className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Uploaded At :</span>{" "}
                    {format(
                        new Date(profileData.submitted_at),
                        "dd MMMM yyyy, 'Time:' h:mm a"
                    )}
                </div>
            )}

            {/* Replace */}
            <div
                onClick={() => {
                    setReplaceField(docKey);
                    fileInputRef.current.click();
                }}
                className="text-[#5737B4] cursor-pointer text-md"
            >
                Replace Document
            </div>

            {/* Actions */}
            <div className="flex gap-5">
                {url && (
                    <div
                        onClick={() => window.open(`${server_url}${url}`, "_blank")}
                        className="cursor-pointer"
                    >
                        <FaEye size={22} />
                    </div>
                )}
            </div>
        </div>
    );
}
