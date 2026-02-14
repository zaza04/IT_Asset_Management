import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  // Next.js 16: searchParams là Promise — phải await
  const params = await searchParams
  const signIn = async (formData: FormData) => {
    "use server"

    try {
      const username = formData.get("username") as string
      const password = formData.get("password") as string
      const email = `${username}@it-management.local`

      const supabase = await createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return redirect(`/sign-in?message=${encodeURIComponent("Đăng nhập thất bại: " + error.message)}`)
      }
    } catch (error) {
      // Next.js Redirect throws an error — phải re-throw
      if ((error as Error).message.includes('NEXT_REDIRECT')) {
        throw error
      }
      return redirect("/sign-in?message=Lỗi hệ thống không mong muốn")
    }

    return redirect("/devices")
  }

  return (
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Đăng nhập hệ thống
      </h1>
      <p className="text-sm text-muted-foreground">
        Nhập tên đăng nhập để truy cập quản lý tài sản
      </p>

      <div className="grid gap-6 pt-4">
        <form action={signIn}>
          <div className="grid gap-4">
            <div className="grid gap-2 text-left">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                name="username"
                placeholder="admin"
                type="text"
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect="off"
                required
              />
            </div>
            <div className="grid gap-2 text-left">
              <div className="flex items-center">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>
            {params?.message && (
              <p className="mt-4 bg-red-100 p-4 text-center text-red-500 rounded-md text-sm">
                {params.message}
              </p>
            )}
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>
        <Button variant="outline" type="button" disabled>
          Login with Google (Coming Soon)
        </Button>
        <div className="mt-4 text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link href="/sign-up" className="underline">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  )
}
