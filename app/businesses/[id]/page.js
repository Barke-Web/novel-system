"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loading from "@/components/ui/Loading";

export default function BusinessDetails() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const response = await fetch(`/api/businesses/${id}`);
        if (!response.ok) throw new Error("Failed to fetch business details");
        const data = await response.json();
        setBusiness(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          <div className="text-red-600 bg-red-100 p-4 rounded-lg">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          <div className="text-gray-600 bg-yellow-100 p-4 rounded-lg">No business found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Business Details</h1>
          <p className="text-gray-600">Detailed information about the registered business</p>
        </div>

        {/* Business Card */}
        <div className="max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-black ring-opacity-5 md:rounded-lg">
          {/* Card Header */}
          <div className="p-6 text-black">
            <label className="block text-sm font-medium text-gray-500 mb-1">Business Name</label>
            <h2 className="text-4xl font-bold mb-6">{business.businessName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                <p className="text-gray-800 font-semibold">{business.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-blue-600 font-semibold">{business.businessEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">KRA Pin</label>
                <p className="text-gray-800 font-semibold font-mono">{business.kraPin}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Registration Number</label>
                <p className="text-gray-800 font-semibold">{business.registrationNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Country</label>
                <p className="text-gray-800 font-semibold">{business.country}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">County</label>
                <p className="text-gray-800 font-semibold">{business.county}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Business Mobile Number</label>
                <p className="text-gray-800 font-semibold">{business.mobileNumber}</p>
              </div>

              {/* Representative Data Section */}
              <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Representative Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Representative First Name</label>
                    <p className="text-gray-800 font-semibold">{business.representativeFirstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Representative Last Name</label>
                    <p className="text-gray-800 font-semibold">{business.representativeLastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Representative Mobile Number</label>
                    <p className="text-gray-800 font-semibold">{business.representativeMobileNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                    <p className="text-gray-800 font-semibold">
                      {new Date(business.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div></div>
            </div></div>

          {/* Card Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Business ID: {id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}