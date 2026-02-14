"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/app/actions/auth"
import { deviceKeys } from "@/hooks/useDevicesQuery"

export function SignInForm({
    initialMessage
}: {
    initialMessage?: string
}) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(initialMessage || null)

    const handleSubmit = (formData: FormData) => {
        setError(null)

        startTransition(async () => {
            const result = await signIn(formData)

            if (result.error) {
                setError(result.error)
                return
            }

            // Important: Force refresh data after login
            // 1. Invalidate device queries
            await queryClient.invalidateQueries({ queryKey: deviceKeys.all })
            await queryClient.resetQueries({ queryKey: deviceKeys.all })

            // 2. Refresh router cache (server components)
            router.refresh()

            // 3. Navigate
            router.push("/devices")
        })
    }

    return (
        <div className="grid gap-6 pt-4">
            <form action={handleSubmit}>
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
                            disabled={isPending}
                        />
                    </div>
                    <div className="grid gap-2 text-left">
                        <div className="flex items-center">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Link
                                href="/forgot-password"
                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                tabIndex={-1}
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang đăng nhập...
                            </>
                        ) : (
                            "Đăng nhập"
                        )}
                    </Button>
                    {error && (
                        <p className="mt-2 bg-destructive/15 p-3 text-center text-destructive rounded-md text-sm font-medium animate-in fade-in slide-in-from-top-1">
                            {error}
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
    )
}
