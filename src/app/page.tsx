import { redirect } from "next/navigation";

// Server Component — redirect ngay trên server, không render HTML
// → tránh hydration mismatch do browser extension inject attributes
export default function HomePage() {
  redirect("/dashboard");
}
