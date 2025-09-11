"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [values, setValues] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState("");
    const router = useRouter();

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setValues({ ...values, [id]: value });

        // Clear errors when user starts typing
        if (errors[id]) {
            setErrors({ ...errors, [id]: "" });
        }
        if (loginError) {
            setLoginError("");
        }
    };

    const validateForm = () => {
        const validationErrors = {};

        if (!values.email) {
            validationErrors.email = "Email is required.";
        } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
            validationErrors.email = "Please enter a valid email address.";
        }

        if (!values.password) {
            validationErrors.password = "Password is required.";
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setLoginError("");

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.email,
                    password: values.password
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Login successful
                console.log("Login successful:", data);
                 localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('authToken', data.token); // if you have a token
                
                
                // Redirect to dashboard
                router.push('/dashboard');
            } else {
                // Login failed
                setLoginError(data.message || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoginError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {/* Card wrapper */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row w-full max-w-6xl min-h-[75vh]">
                {/* Left side with background image */}
                <div className="hidden lg:flex w-1/2 relative">
                    <Image
                        src="/LoginBg.png"
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 opacity-40"></div>
                </div>

                {/* Right side with login form */}
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-6">
                        {/* Logo */}
                        <div className="flex justify-center">
                            <Image
                                src="/Novel.png"
                                alt="Logo"
                                width={165}
                                height={165}
                                priority
                            />
                        </div>

                        {/* Form */}
                        <form className="space-y-6 bg-white p-6 rounded-2xl shadow-lg" onSubmit={handleSubmit}>
                            <h2 className="text-center text-xl font-bold mb-1 text-gray-900">
                                Login to your Account
                            </h2>
                            <p className="text-base text-center text-gray-500">
                                See what is going on with your business
                            </p>

                            {/* Display login error */}
                            {loginError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                    {loginError}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Email field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={values.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        className={`appearance-none rounded-md relative block w-full px-3 py-2 border placeholder-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400 sm:text-sm ${errors.email ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password field with eye toggle */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Password
                                        </label>
                                        <a
                                            href="/forgot-password"
                                            className="text-sm text-orange-400 hover:text-orange-700"
                                        >
                                            Forgot password?
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={values.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter your password"
                                            className={`appearance-none rounded-md relative block w-full px-3 py-2 border placeholder-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400 sm:text-sm pr-10 ${errors.password ? "border-red-500" : "border-gray-300"
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>
                            </div>

                            {/* Create account link */}
                            <div className="text-center text-sm">
                                <p>
                                    Don't have an account?{" "}
                                    <a href="/signup" className="text-orange-400 hover:text-orange-700">
                                        Create Account
                                    </a>
                                </p>
                            </div>

                            {/* Submit button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-400 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                                        }`}
                                >
                                    {isSubmitting ? "Signing In..." : "Sign In"}
                                </button>
                            </div>
                            
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}