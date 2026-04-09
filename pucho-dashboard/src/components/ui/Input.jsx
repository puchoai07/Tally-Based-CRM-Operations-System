import React, { useState } from "react";
import EyeIcon from "../../assets/icons/Property 2=Visible, Property 1=Default.png";
import EyeOffIcon from "../../assets/icons/Property 2=Hidden, Property 1=Default.png";

const Input = ({ label, type = "text", placeholder, value, onChange, icon: Icon, className = "" }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-semibold text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {typeof Icon === 'string' ? (
                            <img src={Icon} alt="" className="w-[18px] h-[18px] opacity-40" />
                        ) : (
                            <Icon size={18} />
                        )}
                    </div>
                )}
                <input
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'} py-3.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pucho-purple/20 focus:border-pucho-purple transition-all duration-200 text-gray-900 placeholder:text-gray-400 bg-gray-50/50`}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    >
                        <img
                            src={showPassword ? EyeOffIcon : EyeIcon}
                            alt="Toggle visibility"
                            className="w-[18px] h-[18px] opacity-40"
                        />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Input;
