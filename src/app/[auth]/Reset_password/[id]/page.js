"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import {
  EXPRESS_PRIVATE_URL,
  Encrypt,
} from "../../../../../Functions/Functions";

import {
  plsWait,
  ErrorMessage,
  SuccessToast,
} from "../../../../../Functions/Mics";

import Footer1 from "@/app/Components/Footer1";
import Nav1 from "@/app/Components/Nav1";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";

const PasswordReset = () => {
  const router = useRouter();
  const params = useParams();
  const UserId = params?.id;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validations = useMemo(
    () => ({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    }),
    [newPassword]
  );

  const strength = useMemo(() => {
    const passed = Object.values(validations).filter(Boolean).length;

    if (passed <= 1) return { score: 20, label: "Very Weak" };
    if (passed === 2) return { score: 40, label: "Weak" };
    if (passed === 3) return { score: 60, label: "Fair" };
    if (passed === 4) return { score: 80, label: "Strong" };
    return { score: 100, label: "Very Strong" };
  }, [validations]);

  const isStrongPassword = Object.values(validations).every(Boolean);

  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === newPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isStrongPassword) {
      return setError("Password does not meet security requirements.");
    }

    if (!passwordsMatch) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      setError("");

      plsWait("Please wait...");

      const response = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/Reset-password/${UserId}/Security`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: Encrypt(newPassword),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to reset password");
      }

      SuccessToast(result.message);

      setNewPassword("");
      setConfirmPassword("");
      router.push("/Login");
    } catch (err) {
      ErrorMessage(err.message);
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  };

  // Optional: Redirect if no UserId
  useEffect(() => {
    if (!UserId) {
      router.push("/Login");
    }
  }, [UserId, router]);

  return (
    <>
      <Nav1 />

      <div
        className="min-h-screen flex items-center justify-center px-4 py-10 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        <Card className="w-full max-w-lg bg-background/95 backdrop-blur-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <LockKeyhole className="h-8 w-8 text-primary" />
            </div>

            <CardTitle className="text-3xl">Reset Password</CardTitle>
            <CardDescription>
              Create a secure password for your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-12"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <Progress value={strength.score} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Strength: <span className="font-medium">{strength.label}</span>
                </p>
              </div>

              {/* Password Requirements */}
              <div className="rounded-xl border p-4 space-y-3 bg-card">
                {[
                  { label: "Minimum 8 characters", valid: validations.length },
                  { label: "At least one uppercase letter", valid: validations.uppercase },
                  { label: "At least one lowercase letter", valid: validations.lowercase },
                  { label: "At least one number", valid: validations.number },
                  { label: "At least one special character", valid: validations.special },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    {item.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={item.valid ? "text-green-600" : "text-muted-foreground"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="pr-12"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {confirmPassword && (
                  <p
                    className={`text-sm font-medium ${
                      passwordsMatch ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={loading || !isStrongPassword || !passwordsMatch}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer1 />
    </>
  );
};

export default PasswordReset;