import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Karis — AI Job Application Assistant",
  description: "Upload your CV once. Karis remembers everything, searches LinkedIn & Indeed, tailors your resume, and applies for you — honestly.",
  keywords: ["job search", "AI resume", "CV tailoring", "LinkedIn", "Indeed", "auto apply"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mesh-bg" />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'toast-custom',
            duration: 4000,
            style: {
              background: 'rgba(22, 22, 35, 0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </body>
    </html>
  );
}
