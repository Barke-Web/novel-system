"use client";
import { useState, useEffect } from 'react';
import BusinessList from '../../components/BusinessList';
import { Sidebar } from "@/components/ui/sidebar";
import Loading from '@/components/ui/Loading';


export default function ApprovedBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApprovedBusinesses();
  }, []);

  const fetchApprovedBusinesses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/businesses?verified=approved');
      
      if (!response.ok) {
        throw new Error('Failed to fetch approved businesses');
      }
      
      const data = await response.json();
      setBusinesses(data);
    } catch (err) {
      console.error('Error fetching approved businesses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
        <div className="w-full bg-gray-50">
          <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Approved Businesses</h1>
            <p className="mt-2 text-sm text-gray-700">
              Verified businesses on the platform.
            </p>
          </div>
        </div>
        
        <BusinessList 
          businesses={businesses} 
          showApproveButton={false}
        />
      </div>
    </div>
    </div>
  );
}