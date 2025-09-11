"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
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
  if (error) return <div>Error: {error}</div>;
  if (!business) return <div>No business found.</div>;

  return (
    <div className="flex">
        <Sidebar />
    <div className="w-[900px] h-[300px] mt-10 align-center mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{business.businessName}</h1>
      <p><strong>Category:</strong> {business.category}</p>
      <p><strong>Email:</strong> {business.businessEmail}</p>
      <p><strong>KRA Pin:</strong> {business.kraPin}</p>
      <p><strong>Mobile Number:</strong> {business.mobileNumber}</p>
      <p><strong>Status:</strong> {business.isVerified}</p>
      <p><strong>Created At:</strong> {business.createdAt}</p>
      {/* Add more fields as needed */}
    </div>
    </div>
  );
}