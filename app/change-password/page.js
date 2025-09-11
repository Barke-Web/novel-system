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
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(passwordData.newPassword)) {
            newErrors.newPassword = "Password must contain uppercase, lowercase, number and special character";
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
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/profile"
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </Link>
                                <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSavePassword}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    <Save size={16} />
                                    {isSaving ? "Saving..." : "Save Password"}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`mb-4 p-3 rounded-md flex items-start gap-2 ${
                                messageType === "error" 
                                    ? "bg-red-100 text-red-700 border border-red-200" 
                                    : "bg-green-100 text-green-700 border border-green-200"
                            }`}>
                                {messageType === "error" && <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />}
                                <span>{message}</span>
                            </div>
                        )}

                        {/* Help Text */}
                        <div className="mb-6 p-3 bg-blue-50 rounded-md border border-blue-200">
                            <p className="text-sm text-blue-700">
                                <strong>Note:</strong> Make sure you're entering your correct current password. 
                                If you've forgotten your password, please contact support.
                            </p>
                        </div>

                        {/* Password Form */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                                                passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
                                            } ${isSaving ? "bg-gray-100" : ""}`}
                                            placeholder="Enter your current password"
                                            disabled={isSaving}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            disabled={isSaving}
                                        >
                                            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {passwordErrors.currentPassword && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                                                passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                                            } ${isSaving ? "bg-gray-100" : ""}`}
                                            placeholder="Enter new password (min 8 characters)"
                                            disabled={isSaving}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            disabled={isSaving}
                                        >
                                            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                                                passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                                            } ${isSaving ? "bg-gray-100" : ""}`}
                                            placeholder="Confirm new password"
                                            disabled={isSaving}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            disabled={isSaving}
                                        >
                                            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
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