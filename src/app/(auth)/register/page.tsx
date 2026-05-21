"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema } from "@/lib/validators/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check, X, Loader2 } from "lucide-react";
import { z } from "zod";

// Create client validation schema extending the registerSchema to require passwords match
const clientRegisterSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ClientRegisterInput = z.infer<typeof clientRegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClientRegisterInput>({
    resolver: zodResolver(clientRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password") || "";

  // Evaluate password strength criteria in real-time
  const checks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const strengthScore = Object.values(checks).filter(Boolean).length;
  const strengthPercentage = (strengthScore / 5) * 100;

  const getStrengthColor = () => {
    if (strengthScore <= 2) return "bg-destructive"; // Red
    if (strengthScore <= 4) return "bg-warning";     // Amber
    return "bg-success";                             // Forest Green
  };

  const getStrengthLabel = () => {
    if (password.length === 0) return "";
    if (strengthScore <= 2) return "Weak";
    if (strengthScore <= 4) return "Medium";
    return "Strong";
  };

  const onSubmit = async (data: ClientRegisterInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Registration failed. Please try again.");
        return;
      }

      toast.success("Account created successfully!");

      // Log in automatically after registration
      const loginRes = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (loginRes?.error) {
        toast.error("Account created, but automatic sign in failed. Please log in manually.");
        router.push("/login");
      } else {
        toast.success("Welcome! Let's set up your profile.");
        router.push("/onboarding");
        router.refresh();
      }
    } catch (error) {
      console.error("Registration submission error:", error);
      toast.error("An unexpected error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/60 bg-card shadow-sm animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-serif font-semibold tracking-tight text-foreground text-center">
          Create account
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground font-sans">
          Start your emotional processing and journaling journey
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="E.g. Haruki"
              disabled={isLoading}
              className="bg-background border-border/80 focus-visible:ring-primary h-11"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1 font-sans">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={isLoading}
              className="bg-background border-border/80 focus-visible:ring-primary h-11"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1 font-sans">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              className="bg-background border-border/80 focus-visible:ring-primary h-11"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1 font-sans">{errors.password.message}</p>
            )}

            {/* Real-time Password Strength meter */}
            {password.length > 0 && (
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
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
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
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/95 text-white font-medium font-sans h-[50px] text-base rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
          <p className="text-sm text-center text-muted-foreground font-sans">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline hover:opacity-85 font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
