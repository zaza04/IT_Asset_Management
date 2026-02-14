import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

// Hàm helper detect base URL — ưu tiên env var, fallback localhost
function getBaseUrl(): string {
    // Ưu tiên 1: NEXT_PUBLIC_SITE_URL (set thủ công cho production)
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL
    }
    // Ưu tiên 2: VERCEL_URL (Vercel tự inject khi deploy)
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }
    // Fallback: localhost cho development
    return "http://localhost:3000"
}

export default async function SignUpPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    // Next.js 16: searchParams là Promise — phải await
    const params = await searchParams
    const signUp = async (formData: FormData) => {
        "use server"

        const username = formData.get("username") as string
        const password = formData.get("password") as string
        const email = `${username}@it-management.local`

        const supabase = await createClient()

        // Detect redirect URL từ env — hoạt động đúng trên cả localhost và production
        const redirectUrl = `${getBaseUrl()}/auth/callback`

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectUrl,
            },
        })

        if (error) {
            return redirect(`/sign-up?message=${encodeURIComponent(error.message)}`)
        }

        // Xóa session tự động từ signUp — buộc user phải đăng nhập lại thủ công
        await supabase.auth.signOut()

        return redirect("/sign-in?message=Đăng ký thành công! Vui lòng đăng nhập.")
    }

    return (
        <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
                Tạo tài khoản mới
            </h1>
            <p className="text-sm text-muted-foreground">
                Nhập tên đăng nhập và mật khẩu để khởi tạo
            </p>

            <div className="grid gap-6 pt-4">
                <form action={signUp}>
                    <div className="grid gap-4">
                        <div className="grid gap-2 text-left">
                            <Label htmlFor="username">Tên đăng nhập</Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="nv001"
                                type="text"
                                autoCapitalize="none"
                                autoComplete="username"
                                autoCorrect="off"
                                required
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Sử dụng mã nhân viên hoặc tên viết tắt (vd: nv.an)
                            </p>
                        </div>
                        <div className="grid gap-2 text-left">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>
                        <Button className="cursor-pointer">
                            Đăng ký ngay
                        </Button>
                        {params?.message && (
                            <p className="mt-4 bg-foreground/10 p-4 text-center text-foreground">
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
                    Github (Coming soon)
                </Button>
                <p className="px-8 text-center text-sm text-muted-foreground">
                    Đã có tài khoản?{" "}
                    <Link
                        href="/sign-in"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    )
}
