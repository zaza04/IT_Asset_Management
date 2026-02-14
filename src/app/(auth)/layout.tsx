import Link from "next/link"
import { Boxes } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 p-6 md:p-10 dark:bg-zinc-900">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Boxes className="size-4" />
            </div>
            IT Asset Management
          </Link>
          <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow">
            <div className="grid min-h-[600px] md:grid-cols-2">
              <div className="relative hidden md:block border-r bg-muted">
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
                />
                <div className="absolute inset-0 bg-zinc-900/40 mix-blend-multiply" />
                <div className="absolute bottom-0 left-0 p-6 text-white z-20">
                  <blockquote className="space-y-2">
                    <p className="text-lg font-medium leading-snug">
                      &ldquo;Scale without chaos.&rdquo;
                    </p>
                    <footer className="text-xs text-zinc-300">IT Operations Platform</footer>
                  </blockquote>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-6 p-6 md:p-8">
                {children}
              </div>
            </div>
          </div>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
}
