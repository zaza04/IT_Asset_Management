import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { inter } from "@/lib/fonts";

import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/CommandPalette";

export const metadata: Metadata = {
  title: "IT Asset Management",
  description: "Quản lý tài sản IT - Device Dashboard",
};

import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} antialiased`}
      style={{ colorScheme: 'light dark' }}
    >
      <body className={inter.className} suppressHydrationWarning={true}>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
          <AuthProvider>
            <QueryProvider>
              <SidebarConfigProvider>
                {children}
                <CommandPalette />
                <Toaster />
              </SidebarConfigProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
