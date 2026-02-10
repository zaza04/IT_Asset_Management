import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập - IT Asset Management",
  description: "Đăng nhập vào hệ thống quản lý tài sản IT",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
