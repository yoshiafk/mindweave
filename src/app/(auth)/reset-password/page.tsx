"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check, X, Loader2 } from "lucide-react";
import { z } from "zod";

// Client-side schema requiring confirmPassword match
const clientResetPasswordSchema = resetPasswordSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ClientResetPasswordInput = z.infer<typeof clientResetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error("Invalid password reset link. No token found.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClientResetPasswordInput>({
    resolver: zodResolver(clientResetPasswordSchema),
    defaultValues: {
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Keep the token field updated in form values
  useEffect(() => {
    if (token) {
      register("token").onChange({ target: { name: "token", value: token } });
    }
  }, [token, register]);

  const newPassword = watch("newPassword") || "";

  // Evaluate password strength criteria in real-time
  const checks = {
    length: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
  };

  const strengthScore = Object.values(checks).filter(Boolean).length;
  const strengthPercentage = (strengthScore / 5) * 100;

  const getStrengthColor = () => {
    if (strengthScore <= 2) return "bg-destructive";
    if (strengthScore <= 4) return "bg-warning";
    return "bg-success";
  };

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return "";
    if (strengthScore <= 2) return "Weak";
    if (strengthScore <= 4) return "Medium";
    return "Strong";
  };

  const onSubmit = async (data: ClientResetPasswordInput) => {
    if (!token) {
      toast.error("Reset token is missing. Please use the link sent to your email.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Password reset failed. The token may be expired.");
        return;
      }

      toast.success("Password reset successful! Redirecting to login...");
      
      // Delay redirect slightly for toast readability
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/60 bg-card shadow-sm animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-serif font-semibold tracking-tight text-foreground text-center">
          Reset password
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground font-sans">
          Enter a new secure password for your MindWeave account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Hidden token field */}
        <input type="hidden" value={token} {...register("token")} />
        
        <CardContent className="space-y-4">
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              disabled={isLoading || !token}
              className="bg-background border-border/80 focus-visible:ring-primary h-11"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive mt-1 font-sans">{errors.newPassword.message}</p>
            )}

            {/* Real-time Password Strength meter */}
            {newPassword.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className="font-semibold text-foreground">{getStrengthLabel()}</span>
                </div>
                <Progress value={strengthPercentage} className="h-1.5" indicatorClassName={getStrengthColor()} />
                
                {/* Requirements Checklist */}
                <div className="grid grid-cols-2 gap-1 pt-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    {checks.length ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3 text-destructive" />
                    )}
                    <span>Min 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {checks.hasUpper ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3 text-destructive" />
                    )}
                    <span>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {checks.hasLower ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3 text-destructive" />
                    )}
                    <span>One lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {checks.hasNumber ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3 text-destructive" />
                    )}
                    <span>One number</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    {checks.hasSpecial ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3 text-destructive" />
                    )}
                    <span>One special character (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              disabled={isLoading || !token}
              className="bg-background border-border/80 focus-visible:ring-primary h-11"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1 font-sans">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
          <Button
            type="submit"
            disabled={isLoading || !token}
            className="w-full bg-primary hover:bg-primary/95 text-white font-medium font-sans h-[50px] text-base rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
          <Link
            href="/login"
            className="text-sm text-primary hover:underline hover:opacity-85 font-medium transition-opacity"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Card className="border-border/60 bg-card shadow-sm text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground mt-4 text-sm">Loading reset form...</p>
      </Card>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
