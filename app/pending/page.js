"use client";

import { useState, useEffect } from 'react';
import BusinessList from '../../components/BusinessList';
import { Sidebar } from "@/components/ui/sidebar";
import Loading from '@/components/ui/Loading';

export default function PendingBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingBusinesses();
  }, []);

  const fetchPendingBusinesses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/businesses?verified=pending');
      if (!response.ok) {
        throw new Error('Failed to fetch pending businesses');
      }
      
      const data = await response.json();
      setBusinesses(data);
    } catch (err) {
      console.error('Error fetching pending businesses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBusiness = async (businessId) => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVerified: "approved" }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve business');
      }

      // Remove the approved business from the list
      setBusinesses(businesses.filter(business => business.id !== businessId));
    } catch (err) {
      console.error('Error approving business:', err);
      alert('Failed to approve business');
    }
  };

  if (loading) {
  return <Loading />;
}


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className='flex'>
      <Sidebar />
    <div className="w-full bg-gray-50 ml-2">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Pending Businesses</h1>
            <p className="mt-2 text-sm text-gray-700">
              Businesses awaiting verification approval.
            </p>
          </div>
        </div>
        
        <BusinessList 
          businesses={businesses} 
          onApprove={handleApproveBusiness}
          showApproveButton={true}
        />
      </div>
    </div>
    </div>
  );
}