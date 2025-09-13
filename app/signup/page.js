"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import countries from "world-countries";
import { Eye, EyeOff } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [values, setValues] = useState({
    businessName: "",
    registrationNumber: "",
    category: "",
    country: "",
    county: "",
    businessEmail: "",
    kraPin: "",
    mobileNumber: "+254",
    representativeFirstName: "",
    representativeLastName: "",
    representativeIdNumber: "",
    representativeEmail: "",
    representativeMobileNumber: "+254",
    representativePassword: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleNext = () => {
    const validationErrors = {};

    if (step === 1) {
      if (!values.businessName || values.businessName.length < 3) {
        validationErrors.businessName = "Business name must be at least 3 characters long";
      }
      if (!values.registrationNumber || values.registrationNumber.length < 5) {
        validationErrors.registrationNumber = "Registration number must be at least 5 characters long";
      }
      if (!values.category) {
        validationErrors.category = "Please select a category";
      }
      if (!values.country) {
        validationErrors.country = "Please select a country";
      }
      if (!values.county) {
        validationErrors.county = "Please select a county";
      }
    } else if (step === 2) {
      if (!values.businessEmail || !/\S+@\S+\.\S+/.test(values.businessEmail)) {
        validationErrors.businessEmail = "Enter a valid email address";
      }
      if (!values.kraPin || !/^[A-Za-z]\d{9}[A-Za-z]$/.test(values.kraPin)) {
        validationErrors.kraPin = "KRA PIN must be 1 letter, 9 digits, 1 letter (e.g. A123456789B)";
      }
      if (!values.mobileNumber || !/^\+\d{9,}$/.test(values.mobileNumber)) {
        validationErrors.mobileNumber = "Phone number must start with + and have at least 9 digits total";
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStep(step + 1);
  };

  const handleBack = () => setStep(Math.max(step - 1, 1));

  const SuccessCard = () => (
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
      <p className="text-gray-600 mb-6">
        Your account has been created successfully. You can now login to access your account.
      </p>

      <button
        onClick={() => window.location.href = "/login"}
        className="bg-orange-400 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-md transition duration-200"
      >
        Go to Login Page
      </button>
    </div>
  );


  const handleSubmit = async () => {
    const validationErrors = {};

    if (!values.representativeFirstName || values.representativeFirstName.length < 2) {
      validationErrors.representativeFirstName = "First name must be at least 2 characters";
    }
    if (!values.representativeLastName || values.representativeLastName.length < 2) {
      validationErrors.representativeLastName = "Last name must be at least 2 characters";
    }
    if (!values.representativeIdNumber || values.representativeIdNumber.length < 6) {
      validationErrors.representativeIdNumber = "ID number must be at least 6 digits";
    }
    if (!values.representativeMobileNumber || !/^\+\d{9,}$/.test(values.representativeMobileNumber)) {
      validationErrors.representativeMobileNumber = "Phone number must start with + and have at least 9 digits total";
    }
    if (!values.representativeEmail || !/\S+@\S+\.\S+/.test(values.representativeEmail)) {
      validationErrors.representativeEmail = "Enter a valid email address";
    }
    if (!values.representativePassword ||
      !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(values.representativePassword)) {
      validationErrors.representativePassword = "Password must be at least 8 characters and include letters, numbers, and symbols";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // This would be your actual API call in production
      const response = await fetch('/api/auth/register', { // Changed path here
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      toast.success('Registration successful!', {
        duration: 3000,
        onAutoClose: () => {
          // After toast closes, show success card
          setStep(4);
        }
      });

    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const kenyaCounties = [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
    "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii",
    "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit",
    "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira",
    "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
    "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
  ];

  const inputField = (label, type = "text", placeholder = "", id) => (
    <div className="flex flex-col w-full">
      <label className="text-base font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={values[id] || ""}
        onChange={handleInputChange}
        className="appearance-none block w-full rounded-md border border-gray-300 
        px-2.5 py-1.5 text-sm text-gray-700 placeholder-gray-400
        focus:outline-none focus:ring-orange-400 focus:border-orange-400"
        required
      />
      {errors[id] && (
        <span className="text-xs text-red-500 mt-1">{errors[id]}</span>
      )}
    </div>
  );

  const passwordField = (label, id, placeholder = "Enter password") => (
    <div className="flex flex-col w-full">
      <label className="text-base font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={values[id] || ""}
          onChange={handleInputChange}
          className="appearance-none block w-full rounded-md border border-gray-300 
          px-2.5 py-1.5 text-sm text-gray-700 placeholder-gray-400
          focus:outline-none focus:ring-orange-400 focus:border-orange-400 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Must include letters, numbers, and symbols
      </div>
      {errors[id] && (
        <span className="text-xs text-red-500 mt-1">{errors[id]}</span>
      )}
    </div>
  );

  const phoneField = (label, id, placeholder = "Enter phone number") => (
    <div className="flex flex-col w-full">
      <label className="text-base font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <div className="flex items-center rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
          +254
        </div>
        <input
          id={id}
          type="tel"
          placeholder={placeholder}
          value={values[id] ? values[id].substring(4) : ""}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9]/g, '');
            setValues(prev => ({
              ...prev,
              [id]: '+254' + numericValue
            }));

            if (errors[id]) {
              setErrors({ ...errors, [id]: "" });
            }
          }}
          className="appearance-none rounded-md block w-full px-2.5 py-1.5 
            border border-gray-300 placeholder-gray-400 text-sm
            focus:outline-none focus:ring-orange-400 focus:border-orange-400"
          required
          maxLength={9}
        />
      </div>
      {errors[id] && (
        <span className="text-xs text-red-500 mt-1">{errors[id]}</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {step === 4 ? (
        <SuccessCard />
      ) : (
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 space-y-4">
          <div className="flex justify-center">
            <Image
              src="/Novel.png"
              alt="Logo"
              width={165}
              height={165}
              priority
            />
          </div>

          <div className="text-center">
            <h1 className="text-lg font-semibold">Membership Registration</h1>
            <p className="text-base text-gray-500">
              Join the Novel Tobacco Products Association
            </p>
          </div>

          <div className="relative flex items-center justify-between mb-6">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-orange-400 transition-all duration-500 -z-10"
              style={{
                width: `${((step - 1) / 2) * 100}%`,
              }}
            ></div>

            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center w-1/3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm
              transition-all duration-500 
              ${step === stepNum
                      ? "bg-orange-400 scale-105"
                      : step > stepNum
                        ? "bg-orange-400"
                        : "bg-gray-300"
                    }`}
                >
                  {stepNum}
                </div>
              </div>
            ))}
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                {step === 1
                  ? "Business Information"
                  : step === 2
                    ? "Business Contact"
                    : "Representative Information"}
              </h2>
              <p className="text-xs text-gray-600">
                {step === 1
                  ? "Enter your business details for membership"
                  : step === 2
                    ? "Provide your business contact information"
                    : "Enter details of the authorized representative"}
              </p>
            </div>
            <hr className="my-3 border-gray-200" />

            {step === 1 && (
              <div className="grid grid-cols-2 gap-3 min-h-[220px]">
                {inputField("Business Name", "text", "Enter business name", "businessName")}
                {inputField("Registration Number", "text", "Enter registration number", "registrationNumber")}
                <div className="flex flex-col w-full">
                  <label className="text-base font-medium text-gray-700 mb-1">
                    Member Category <span className="text-red-500">*</span>
                  </label>
                  <Select value={values.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <span className="text-xs text-red-500 mt-1">{errors.category}</span>
                  )}
                </div>
                <div className="flex flex-col w-full">
                  <label className="text-base font-medium text-gray-700 mb-1">
                    BRS Certificate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-700 
                  border border-gray-300 rounded-md cursor-pointer
                  file:mr-3 file:py-1.5 file:px-3
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-orange-400 file:text-white
                  hover:file:bg-orange-600
                  focus:outline-none focus:ring-orange-400 focus:border-orange-400"
                    required
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label className="text-base font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Select value={values.country} onValueChange={(value) => handleSelectChange("country", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {countries.map((c) => (
                        <SelectItem key={c.cca3} value={c.cca3}>
                          {c.flag} {c.name.common}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <span className="text-xs text-red-500 mt-1">{errors.country}</span>
                  )}
                </div>

                <div className="flex flex-col w-full">
                  <label className="text-base font-medium text-gray-700 mb-1">
                    County <span className="text-red-500">*</span>
                  </label>
                  <Select value={values.county} onValueChange={(value) => handleSelectChange("county", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select County" />
                    </SelectTrigger>
                    <SelectContent>
                      {kenyaCounties.map((county) => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.county && (
                    <span className="text-xs text-red-500 mt-1">{errors.county}</span>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 gap-3 min-h-[220px]">
                {phoneField("Mobile Number", "mobileNumber")}
                {inputField("Business Email", "email", "Enter business email", "businessEmail")}
                {inputField("KRA Pin", "text", "e.g. A123456789B", "kraPin")}
                <div className="flex flex-col w-full">
                  <label className="text-base font-medium text-gray-700 mb-1">
                    KRA Pin Certificate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-700 
                  border border-gray-300 rounded-md cursor-pointer
                  file:mr-3 file:py-1.5 file:px-3
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-orange-400 file:text-white
                  hover:file:bg-orange-600
                  focus:outline-none focus:ring-orange-400 focus:border-orange-400"
                    required
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-3 min-h-[220px]">
                {inputField("First Name", "text", "Enter first name", "representativeFirstName")}
                {inputField("Last Name", "text", "Enter last name", "representativeLastName")}
                {inputField("Representative Email", "email", "Enter representative email", "representativeEmail")}
                {phoneField("Mobile Number", "representativeMobileNumber", "Enter phone number")}
                {inputField("ID Number", "text", "Enter ID number", "representativeIdNumber")}
                <div className="flex flex-col w-full">
                  <label className="text-base font-medium text-gray-700 mb-1">
                    ID Copy <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-700 
                  border border-gray-300 rounded-md cursor-pointer
                  file:mr-3 file:py-1.5 file:px-3
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-orange-400 file:text-white
                  hover:file:bg-orange-600
                  focus:outline-none focus:ring-orange-400 focus:border-orange-400"
                    required
                  />
                </div>
                {passwordField("Password", "representativePassword", "Enter password")}
              </div>
            )}

            <div className="flex justify-between mt-5">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="border border-gray-300 text-gray-700 px-5 py-1.5 rounded-md text-sm hover:bg-gray-100"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="border border-orange-400 bg-orange-400 text-white px-6 py-1.5 rounded-md text-sm hover:bg-orange-600"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="border border-orange-400 bg-orange-400 text-white px-6 py-1.5 rounded-md text-sm hover:bg-orange-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Finish"}
                </button>
              )}
            </div>
          </div>
          <Toaster position="top-right" />
          {step === 1 && (
            <p className="text-center text-base text-gray-600 mt-3">
              Already a member?{" "}
              <a
                href="/login"
                className="text-orange-400 hover:text-orange-700 font-medium"
              >
                Sign in
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}