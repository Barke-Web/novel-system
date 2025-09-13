import { EyeIcon } from 'lucide-react';
import Link from 'next/link';

export default function BusinessList({ businesses, onApprove, showApproveButton }) {
  const getStatusBadge = (isVerified) => {
    const statusStyles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    const status = isVerified === 'approved' ? 'approved' : 'pending';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (businesses?.length === 0) {
    return (
      <div className="mt-8 bg-white shadow rounded-lg p-7 text-center">
        <p className="text-gray-500">No businesses found.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Business Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Registration Number
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Contact
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {businesses?.map((business) => (
                  <tr key={business.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-blue-800">{business.businessName.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{business.businessName}</div>
                          <div className="text-gray-500">{business.country}, {business.county}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {business.category}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {business.registrationNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="text-gray-900">{business.businessEmail}</div>
                      <div className="text-gray-500">{business.mobileNumber}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {getStatusBadge(business.isVerified)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-6">
                      <div
                        className={
                          showApproveButton
                            ? "flex justify-end items-center gap-3"
                            : "flex justify-center items-center"
                        }
                      >
                        <Link href={`/businesses/${business.id}`} aria-label="View business details">
                          <button
                            className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                            type="button"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                          </button>
                        </Link>
                        {showApproveButton && (
                          <button
                            onClick={() => onApprove(business.id)}
                            className="inline-flex items-center px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition"
                            type="button"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}