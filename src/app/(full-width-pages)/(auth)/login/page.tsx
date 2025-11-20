"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, EyeCloseIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import OTPInput from "@/components/form/input/OTPInput";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { useLogin, useVerifyOTP, useResendOTP } from "@/hooks/api";
import type { OTPRequiredResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [otpRequired, setOTPRequired] = useState(false);
  const [otpEmail, setOTPEmail] = useState("");
  const [otpCode, setOTPCode] = useState("");
  const [otpExpiresIn, setOTPExpiresIn] = useState(300); // 5 minutes
  const [timeLeft, setTimeLeft] = useState(300);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  const loginMutation = useLogin();
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!otpRequired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpRequired, otpExpiresIn]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation.mutateAsync(data);

      // Check if OTP is required
      if ("requireOTP" in result && result.requireOTP) {
        const otpData = result as OTPRequiredResponse;
        setOTPRequired(true);
        setOTPEmail(otpData.email);
        setOTPExpiresIn(otpData.expiresIn);
        setTimeLeft(otpData.expiresIn);

        // For development: auto-fill OTP if provided
        if (otpData.code) {
          setOTPCode(otpData.code);
          console.log("🔐 DEV MODE - OTP Code:", otpData.code);
        }
      }
      // If no OTP required, login will handle redirect in onSuccess
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      return;
    }

    try {
      await verifyOTPMutation.mutateAsync({
        email: otpEmail,
        code: otpCode,
      });
    } catch (error) {
      console.error("OTP verification error:", error);
    }
  };

  const handleResendOTP = async () => {
    try {
      const result = await resendOTPMutation.mutateAsync(otpEmail);
      setOTPExpiresIn(result.expiresIn);
      setTimeLeft(result.expiresIn);
      setOTPCode("");
    } catch (error) {
      console.error("Resend OTP error:", error);
    }
  };

  const handleBackToLogin = () => {
    setOTPRequired(false);
    setOTPEmail("");
    setOTPCode("");
    setTimeLeft(300);
  };

  return (
    <div className="flex flex-1 flex-col lg:w-1/2">
      {/* Form Container */}
      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              {otpRequired ? "Xác thực OTP" : "Đăng nhập"}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {otpRequired
                ? `Nhập mã xác thực đã được gửi đến ${otpEmail}`
                : "Nhập email và mật khẩu để đăng nhập vào hệ thống"}
            </p>
          </div>

          {!otpRequired ? (
            /* Login Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  {...register("email")}
                  error={errors.email?.message}
                  disabled={loginMutation.isPending}
                />
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    error={errors.password?.message}
                    disabled={loginMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeCloseIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <Checkbox
                  id="remember_me"
                  label="Ghi nhớ đăng nhập"
                  {...register("remember_me")}
                />
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={loginMutation.isPending}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          ) : (
            /* OTP Verification Form */
            <div className="space-y-6">
              {/* OTP Input */}
              <div>
                <Label htmlFor="otp">
                  Mã xác thực (OTP) <span className="text-red-500">*</span>
                </Label>
                <OTPInput
                  length={6}
                  value={otpCode}
                  onChange={setOTPCode}
                  disabled={verifyOTPMutation.isPending || timeLeft === 0}
                  autoFocus
                />
              </div>

              {/* Timer */}
              <div className="text-center">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mã sẽ hết hạn sau:{" "}
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-error-600 dark:text-error-400 font-medium">
                    Mã xác thực đã hết hạn
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={handleVerifyOTP}
                isLoading={verifyOTPMutation.isPending}
                disabled={
                  verifyOTPMutation.isPending ||
                  otpCode.length !== 6 ||
                  timeLeft === 0
                }
              >
                {verifyOTPMutation.isPending ? "Đang xác thực..." : "Xác thực"}
              </Button>

              {/* Resend OTP */}
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendOTPMutation.isPending || timeLeft > 240}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendOTPMutation.isPending
                    ? "Đang gửi..."
                    : "Gửi lại mã xác thực"}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {timeLeft > 240 && "Vui lòng đợi 1 phút trước khi gửi lại"}
                </p>
              </div>

              {/* Back to Login */}
              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Quay lại đăng nhập
              </button>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Liên hệ quản trị viên nếu bạn gặp vấn đề đăng nhập
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
