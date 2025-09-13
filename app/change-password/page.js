"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Save, X, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ChangePasswordPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "success" or "error"
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const router = useRouter();

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
        
        // Clear message when user starts typing
        if (message) {
            setMessage("");
            setMessageType("");
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!passwordData.currentPassword.trim()) {
            newErrors.currentPassword = "Current password is required";
        }

        if (!passwordData.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
        } else if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(passwordData.newPassword)) {
            newErrors.newPassword = "Password must contain letters, numbers, and symbols";
        }

        if (!passwordData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your new password";
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setPasswordErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSavePassword = async () => {
        if (!validatePasswordForm()) {
            return;
        }

        setIsSaving(true);
        setMessage("");
        setMessageType("");

        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setMessage("User not authenticated. Please log in again.");
                setMessageType("error");
                setIsSaving(false);
                setTimeout(() => router.push('/login'), 2000);
                return;
            }

            console.log('Sending password update request for user:', userId);
            
            const response = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }),
            });

            console.log('Response status:', response.status);
            
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error(`Server returned invalid response: ${responseText}`);
            }

            if (!response.ok) {
                console.error('Server error response:', data);
                
                // Handle specific error cases
                if (data.message === "Error verifying password") {
                    throw new Error("The current password you entered is incorrect. Please try again.");
                } else if (data.message === "User not found") {
                    throw new Error("User account not found. Please log in again.");
                } else {
                    throw new Error(data.message || `Server error: ${response.status}`);
                }
            }

            if (data.success) {
                setMessage("Password updated successfully! Redirecting to profile...");
                setMessageType("success");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setPasswordErrors({});
                
                // Clear success message after 3 seconds and redirect
                setTimeout(() => {
                    router.push('/profile');
                }, 3000);
            } else {
                setMessage(data.message || "Error updating password");
                setMessageType("error");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            setMessage(error.message || "Error updating password. Please try again.");
            setMessageType("error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/profile');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/profile"
                                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                                >
                                    <ArrowLeft size={20} />
                                </Link>
                                <h1 className="text-2xl font-semibold text-gray-900">Change Password</h1>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <button
                                    onClick={handleSavePassword}
                                    disabled={isSaving}
                                    className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-400 disabled:opacity-50 transition-colors w-full sm:w-auto"
                                >
                                    <Save size={16} />
                                    {isSaving ? "Saving..." : "Save Password"}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                                messageType === "error" 
                                    ? "bg-red-50 text-red-800 border border-red-100" 
                                    : "bg-green-50 text-green-800 border border-green-100"
                            }`}>
                                {messageType === "error" ? (
                                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <span className="text-sm">{message}</span>
                            </div>
                        )}

                        {/* Password Form */}
                        <div className="space-y-6">
                            <div className="space-y-5">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
                                                passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
                                            } ${isSaving ? "bg-gray-100" : ""}`}
                                            placeholder="Enter your current password"
                                            disabled={isSaving}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                            disabled={isSaving}
                                        >
                                            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {passwordErrors.currentPassword && (
                                        <p className="mt-2 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
                                                passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                                            } ${isSaving ? "bg-gray-100" : ""}`}
                                            placeholder="Enter new password (min 8 characters)"
                                            disabled={isSaving}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                            disabled={isSaving}
                                        >
                                            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword && (
                                        <p className="mt-2 text-sm text-red-600">{passwordErrors.newPassword}</p>
                                    )}
                                    <p className="mt-2 text-xs text-gray-500">
                                        Password must be at least 8 characters and include letters, numbers, and symbols.
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
                                                passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                                            } ${isSaving ? "bg-gray-100" : ""}`}
                                            placeholder="Confirm new password"
                                            disabled={isSaving}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                            disabled={isSaving}
                                        >
                                            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <p className="mt-2 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}