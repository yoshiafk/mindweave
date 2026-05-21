import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-background selection:bg-lavender/30 selection:text-foreground">
      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="group">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-primary group-hover:opacity-80 transition-opacity">
              {siteConfig.name}
            </h1>
          </Link>
          <p className="text-sm text-muted-foreground font-sans max-w-xs">
            {siteConfig.tagline}
          </p>
        </div>

        {/* Form Card Container */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
