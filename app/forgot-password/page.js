"use client";

import Image from "next/image";

export default function ForgetPage() {

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
                    />
                    <div className="absolute inset-0 opacity-40"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-white text-3xl font-bold text-center">Learn more about NTPA on
                            noveltobacco.co.ke</h1>
                    </div>
                </div>

                {/* Right side with login form */}
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-6">
                        {/* Logo */}
                        <div className="flex justify-center">
                            <Image src="/Novel.png" alt="Logo" width={165} height={165} />
                        </div>

                        {/* Form */}
                        <form className="space-y-6 bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-center text-2xl mb-1 font-bold text-gray-900">
                                Forgot password?
                            </h2>
                            <p className="text-x1 text-gray-500 text-center">
                                Enter your email to reset your password
                            </p>

                            <div className="space-y-4">
                                {/* Email field */}
                                <div> <p className="mb-1">Email Address </p>
                                    <label htmlFor="email" className="sr-only">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="Email"
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-orange-400 focus:border-orange-400 sm:text-sm"
                                    />
                                </div>
                                <div className="text-center text-sm">
                                    <p>
                                        Rememeber Password?{" "}
                                        <a href="/login" className="text-orange-400 hover:text-orange-700">
                                            Login
                                        </a>
                                    </p>
                                </div>
                                {/* Submit button */}
                                <div>
                                    <button
                                        type="submit"
                                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-400 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                                    >
                                        Send Rest Link
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
