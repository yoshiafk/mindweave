"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.toLowerCase() }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Something went wrong. Please try again.");
        return;
      }

      toast.success("Instructions sent!");
      setIsSuccess(true);
    } catch (error) {
      console.error("Forgot password submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-border/60 bg-card shadow-sm animate-fade-in text-center">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Check your email
          </CardTitle>
          <CardDescription className="font-sans">
            If the email address is registered, we have sent instructions to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground font-sans px-6">
          Be sure to check your spam folder if you do not see the email in your inbox within a few minutes.
        </CardContent>
        <CardFooter className="flex flex-col pt-4 pb-6">
          <Link href="/login" className="w-full">
            <Button
              variant="outline"
              className="w-full border-border/80 text-foreground font-sans hover:bg-muted/50 h-11"
            >
              Back to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card shadow-sm animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-serif font-semibold tracking-tight text-foreground text-center">
          Forgot password?
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground font-sans">
          Enter your email address and we will send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
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
                Sending link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
          <Link
            href="/login"
            className="text-sm text-primary hover:underline hover:opacity-85 font-medium flex items-center gap-1.5 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
