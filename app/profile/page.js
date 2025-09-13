"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Save, Edit, X } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import Loading from "@/components/ui/Loading";
import { User, Mail, Phone, IdCard } from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const router = useRouter();

    // Form state
    const [formData, setFormData] = useState({
        representativeEmail: "",
        representativeMobileNumber: "",
    });

    const [isEditingPassword, setIsEditingPassword] = useState(false);
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

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setMessage("");

                // Get userId from localStorage
                const userId = localStorage.getItem('userId');

                if (!userId) {
                    setMessage("User not authenticated");
                    setLoading(false);
                    router.push('/login');
                    return;
                }

                // Fetch user data with userId as query parameter
                const response = await fetch(`/api/auth/profile?userId=${userId}`);

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    setFormData({
                        representativeEmail: userData.representativeEmail || "",
                        representativeMobileNumber: userData.representativeMobileNumber || "",
                    });
                } else {
                    // If API fails, check if we have stored user data
                    const storedUserData = localStorage.getItem('userData');
                    if (storedUserData) {
                        try {
                            const parsedUser = JSON.parse(storedUserData);
                            setUser(parsedUser);
                            setFormData({
                                representativeEmail: parsedUser.representativeEmail || "",
                                representativeMobileNumber: parsedUser.representativeMobileNumber || "",
                            });
                        } catch (parseError) {
                            console.error("Error parsing stored user data:", parseError);
                            setMessage("Error loading profile data");
                        }
                    } else {
                        const errorData = await response.json();
                        setMessage(errorData.message || "Failed to load user data");
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setMessage("Error loading profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Only validate editable fields
        if (!formData.representativeEmail.trim()) {
            newErrors.representativeEmail = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.representativeEmail)) {
            newErrors.representativeEmail = "Please enter a valid email address";
        }

        // Mobile number validation (optional)
        if (formData.representativeMobileNumber && !/^[\d\s\-\+\(\)]{10,}$/.test(formData.representativeMobileNumber)) {
            newErrors.representativeMobileNumber = "Please enter a valid mobile number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSaving(true);
        setMessage("");

        try {
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setMessage("User not authenticated");
                setIsSaving(false);
                return;
            }

            // Only send the fields that are allowed to be updated
            const updateData = {
                representativeEmail: formData.representativeEmail,
                representativeMobileNumber: formData.representativeMobileNumber
            };

            const response = await fetch(`/api/auth/profile?userId=${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            // First check if the response is OK
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server responded with error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Try to parse as JSON
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                throw new Error('Invalid response from server');
            }

            if (result.success) {
                setMessage("Profile updated successfully!");
                setIsEditing(false);
                setIsEditingPassword(false); // Reset password editing when saving profile

                // Update local user data with only the changed fields
                const updatedUser = {
                    ...user,
                    representativeEmail: formData.representativeEmail,
                    representativeMobileNumber: formData.representativeMobileNumber
                };
                setUser(updatedUser);
                localStorage.setItem('userData', JSON.stringify(updatedUser));
            } else {
                setMessage(result.message || "Error updating profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage("Error updating profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to original user data
        setFormData({
            representativeEmail: user.representativeEmail || "",
            representativeMobileNumber: user.representativeMobileNumber || "",
        });
        setIsEditing(false);
        setErrors({});
        setMessage("");
    };


    if (loading) {
  return <Loading />;
}


    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Please log in to view your profile</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                {/* Header outside the card */}
                <div className="w-full max-w-6xl mx-auto mt-8 px-4">
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            Profile Information
                        </h1>
                        <p className="text-gray-600 mt-2">Manage your profile details and keep your information up to date</p>
                    </div>
                </div>

                {/* Card with form fields and buttons only */}
                <div className="flex-1 flex justify-center">
                    <div className="w-full max-w-6xl px-4">
                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl overflow-hidden ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            {/* Action buttons and header in the same row */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                                        <User size={20} className="text-orange-500" />
                                        Personal Information
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Your basic profile details</p>
                                </div>
                                <div>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 bg-orange-400 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow"
                                        >
                                            <Edit size={18} />
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 bg-[#50C878] text-white px-5 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors shadow"
                                            >
                                                <Save size={18} />
                                                {isSaving ? "Saving..." : "Save"}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex items-center gap-2 bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow"
                                            >
                                                <X size={18} />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message */}
                            {message && (
                                <div className={`mb-6 p-4 rounded-lg text-center font-semibold ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                    {message}
                                </div>
                            )}

                            {/* Profile Form */}
                            <div className="space-y-8">
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* First Name - READ ONLY */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <User size={16} />
                                                First Name
                                            </label>
                                            <div className="flex items-center bg-gray-100 p-3 rounded-lg border border-gray-200">
                                                <span className="text-base text-gray-900">
                                                    {user.representativeFirstName}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Last Name - READ ONLY */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <User size={16} />
                                                Last Name
                                            </label>
                                            <div className="flex items-center bg-gray-100 p-3 rounded-lg border border-gray-200">
                                                <span className="text-base text-gray-900">
                                                    {user.representativeLastName}
                                                </span>
                                            </div>
                                        </div>
                                        {/* ID Number - READ ONLY */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <IdCard size={16} />
                                                ID Number
                                            </label>
                                            <div className="flex items-center bg-gray-100 p-3 rounded-lg border border-gray-200">
                                                <span className="text-base text-gray-900">
                                                    {user.representativeIdNumber}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Email - EDITABLE */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <Mail size={16} />
                                                Email *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    name="representativeEmail"
                                                    value={formData.representativeEmail}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    maxLength={40}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 pl-10 ${errors.representativeEmail ? "border-red-500" : "border-gray-300"} ${!isEditing ? "bg-gray-100" : "bg-white"}`}
                                                />
                                                <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                            </div>
                                            {errors.representativeEmail && (
                                                <p className="mt-2 text-sm text-red-600">{errors.representativeEmail}</p>
                                            )}
                                        </div>
                                        {/* Mobile Number - EDITABLE */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <Phone size={16} />
                                                Mobile Number
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    name="representativeMobileNumber"
                                                    value={formData.representativeMobileNumber}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    maxLength={13}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 pl-10 ${errors.representativeMobileNumber ? "border-red-500" : "border-gray-300"} ${!isEditing ? "bg-gray-100" : "bg-white"}`}
                                                />
                                                <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                            </div>
                                            {errors.representativeMobileNumber && (
                                                <p className="mt-2 text-sm text-red-600">{errors.representativeMobileNumber}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}