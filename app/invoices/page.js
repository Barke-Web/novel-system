'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/ui/sidebar";
import Loading from '@/components/ui/Loading';
import { checkAuth, getToken } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

function formatPhoneNumberForMpesa(phoneNumber) {
  const formattedNumber = phoneNumber.replace(/\D/g, '');
  return formattedNumber;
}

export default function InvoicesPage() {
  const [businesses, setBusinesses] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Combined authentication and data fetching
  useEffect(() => {
    const verifyAuthAndFetchData = async () => {
      const auth = await checkAuth();
      
      if (!auth) {
        router.push('/login');
        return;
      }
      
      setIsAuthenticated(true);
      await fetchData();
      setLoading(false);
    };

    verifyAuthAndFetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = getToken(); // Get the token for API calls
      
      const [businessesResponse, categoriesResponse] = await Promise.all([
        fetch('/api/businesses', {
          headers: {
            'Authorization': `Bearer ${token}` // Add authorization header
          }
        }),
        fetch('/api/category', {
          headers: {
            'Authorization': `Bearer ${token}` // Add authorization header
          }
        })
      ]);

      if (!businessesResponse.ok || !categoriesResponse.ok) {
        // If unauthorized, redirect to login
        if (businessesResponse.status === 401 || categoriesResponse.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch data');
      }

      const businessesData = await businessesResponse.json();
      const categoriesData = await categoriesResponse.json();


      setBusinesses(businessesData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFee = (categoryName) => {
    if (!categoryName) return 0;

    const category = categories.find(cat =>
      cat.name.toLowerCase().includes(categoryName.toLowerCase()) ||
      categoryName.toLowerCase().includes(cat.name.toLowerCase())
    );

    return category ? category.fee : 0.00;
  };

  const generateInvoice = (business) => {
    setSelectedBusiness(business);
    setShowInvoice(true);
    setShowPayment(false);
  };

  const initiatePayment = async () => {
  if (!selectedBusiness) {
    toast.error('No business selected for payment');
    return;
  }

  // Validate phone number
  const formattedPhone = formatPhoneNumberForMpesa(selectedBusiness.mobileNumber);
  if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
    toast.error('Invalid phone number format. Please use 07XXXXXXXX or 2547XXXXXXXX format.');
    return;
  }

  // Validate amount
  const amount = getCategoryFee(selectedBusiness.category);
  if (!amount || amount <= 0) {
    toast.error('Invalid payment amount');
    return;
  }

  setProcessingPayment(true);
  try {
    console.log('Initiating M-Pesa payment for:', selectedBusiness.id);
    const token = getToken();
    
    const paymentData = {
      phoneNumber: formattedPhone,
      amount: amount,
      businessId: selectedBusiness.id,
      accountReference: `INV-${selectedBusiness.id}`,
      description: `Business Registration - ${selectedBusiness.businessName}`
    };

    console.log('Payment data:', paymentData);

    const response = await fetch('/api/payments/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('M-Pesa response:', result);

    if (result.success) {
      toast.success('M-Pesa prompt sent to your phone! Complete the payment on your device.');
      const checkoutRequestID = result.data.CheckoutRequestID;
      checkPaymentStatus(checkoutRequestID);
    } else {
      throw new Error(result.message || 'M-Pesa payment failed');
    }

  } catch (error) {
    console.error('M-Pesa payment initiation failed:', error);
    toast.error('Payment initiation failed: ' + error.message);
  } finally {
    setProcessingPayment(false);
  }
};

  const checkPaymentStatus = async (checkoutRequestID) => {
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max (10 seconds * 30)

    const checkStatus = async () => {
      try {
        attempts++;
        console.log(`Checking payment status (attempt ${attempts})...`);

        const response = await fetch('/api/payments/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ checkoutRequestID }),
        });

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }

        const statusData = await response.json();
        console.log('Payment status response:', statusData);

        if (statusData.success) {
          const resultCode = statusData.data.ResultCode;

          if (resultCode === 0) {
            // Payment completed successfully
            toast.success('Payment completed successfully!');
            setShowPayment(false);
            // Refresh business data
            fetchData();
            return;
          } else if (resultCode === 1032) {
            // Request cancelled by user
            toast.error('Payment was cancelled. Please try again.');
            return;
          } else if (resultCode === 1037) {
            // Request timeout - user didn't respond
            toast.error('Payment timeout. Please check your phone and try again.');
            return;
          } else if (resultCode === 1) {
            // Insufficient funds or other error
            toast.error('Payment failed: Insufficient funds or transaction declined.');
            return;
          } else {
            // Other error - continue polling
            console.log('Payment still processing...');
          }
        }

        // Continue polling if not completed and within max attempts
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else {
          toast.error('Payment verification timeout. Please check your M-Pesa messages.');
        }

      } catch (error) {
        console.error('Error checking payment status:', error);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000);
        } else {
          toast.error('Unable to verify payment status. Please check your M-Pesa messages.');
        }
      }
    };

    // Start polling
    checkStatus();
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return <Loading />;
  }
   if (!isAuthenticated) {
    return null;
  }
  return (
    <div className='flex'>
      <Sidebar />
      <div className="w-full bg-gray-50 ml-2">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="mt-2 text-sm text-gray-700">
                Generate and export invoices for business registrations.
              </p>
            </div>
          </div>

          {!showInvoice ? (
            // Business List View
            <div className="mt-8">
              {businesses.filter(business => business.isVerified === 1 || business.isVerified === "approved").length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No verified businesses</h3>
                  <p className="mt-1 text-sm text-gray-500">Only approved businesses are shown here. Approve some businesses to generate invoices.</p>
                </div>
              ) : (
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registration Fee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {businesses
                          .filter(business => business.isVerified === 1 || business.isVerified === "approved")
                          .map((business) => (
                            <tr key={business.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {business.businessName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {business.registrationNumber}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {business.category}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">
                                  KES {getCategoryFee(business.category).toLocaleString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                    <circle cx={4} cy={4} r={3} />
                                  </svg>
                                  Verified
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => generateInvoice(business)}
                                  className="bg-orange-400 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                  </svg>
                                  Generate Invoice
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : !showPayment ? (
            // Invoice View with Payment Button
            // Invoice View with Payment Button
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to List
                  </button>
                </div>
                <div className="flex gap-2 no-print">
                  {selectedBusiness && (
                    <button
                      onClick={() => setShowPayment(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Pay Now
                    </button>
                  )}
                  <button
                    onClick={printInvoice}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                </div>
              </div>

              {!selectedBusiness ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading invoice details...</p>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-lg ring-1 ring-gray-900/5">
                  <div id="invoice" className="max-w-4xl mx-auto">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-center mb-8 pb-4 border-b">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                        <p className="text-gray-600">Registration Fee</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-xl font-semibold">Business Registry</h2>
                        <p className="text-gray-600">Official Registration System</p>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                        <p className="font-medium">{selectedBusiness.businessName}</p>
                        <p>{selectedBusiness.representativeFirstName} {selectedBusiness.representativeLastName}</p>
                        <p>{selectedBusiness.businessEmail}</p>
                        <p>{selectedBusiness.mobileNumber}</p>
                        <p>KRA PIN: {selectedBusiness.kraPin}</p>
                      </div>
                      <div className="text-right md:text-left">
                        <h3 className="font-semibold text-gray-900 mb-2">Invoice Details:</h3>
                        <p><span className="font-medium">Invoice #:</span> INV-{selectedBusiness.id.toString().padStart(4, '0')}</p>
                        <p><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</p>
                        <p><span className="font-medium">Registration #:</span> {selectedBusiness.registrationNumber}</p>
                        <p><span className="font-medium">Status:</span> {selectedBusiness.isVerified ? 'Verified' : 'Pending'}</p>
                      </div>
                    </div>

                    {/* Invoice Items */}
                    <div className="mb-8">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Description</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Category</th>
                            <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-3">
                              Business Registration Fee
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              {selectedBusiness.category || 'N/A'}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                              KES {getCategoryFee(selectedBusiness.category).toLocaleString()}
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td colSpan="2" className="border border-gray-300 px-4 py-3 text-right font-semibold">
                              Total Amount:
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-lg">
                              KES {getCategoryFee(selectedBusiness.category).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="mt-12 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
                      <p className="text-sm text-gray-600">
                        • This invoice is for business registration services<br />
                        • Payment should be made within 30 days<br />
                        • Late payments may incur additional fees<br />
                        • For questions, contact support@businessregistry.com
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-gray-500 text-sm">
                      <p>Thank you for your business!</p>
                      <p>Business Registry • support@businessregistry.com • +254 700 000 000</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Payment View - M-Pesa Only
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setShowPayment(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Invoice
                </button>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg ring-1 ring-gray-900/5 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">M-Pesa Payment</h2>

                {!selectedBusiness ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payment details...</p>
                  </div>
                ) : (
                  <>
                    <div className="border border-green-200 rounded-lg p-6 bg-green-50 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">M-Pesa Mobile Money</h3>
                            <p className="text-sm text-gray-600">Pay via M-Pesa to complete your registration</p>
                            <p className="text-xs text-gray-500 mt-1">
                              For: {selectedBusiness.businessName}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={initiatePayment}
                          disabled={processingPayment}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-md disabled:opacity-50 flex items-center"
                        >
                          {processingPayment ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            'Pay with M-Pesa'
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Payment Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-blue-900 mb-2">How to Pay:</h4>
                      <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                        <li>Check your phone for M-Pesa prompt</li>
                        <li>Enter your M-Pesa PIN when prompted</li>
                        <li>Wait for payment confirmation</li>
                        <li>Payment status will update automatically</li>
                      </ol>
                    </div>

                    {/* Payment Summary */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Payment Summary</h3>
                      <div className="flex justify-between items-center">
                        <span>Registration Fee:</span>
                        <span className="font-semibold">KES {getCategoryFee(selectedBusiness.category).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                        <span className="font-semibold">Total Amount:</span>
                        <span className="font-semibold text-lg">KES {getCategoryFee(selectedBusiness.category).toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Print Styles */}
          <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice, #invoice * {
                        visibility: visible;
                    }
                    #invoice {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 0;
                        margin: 0;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
      </div>
    </div>
  );
}