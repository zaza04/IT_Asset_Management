import { SignInForm } from "@/components/auth/sign-in-form"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Đăng nhập hệ thống
      </h1>
      <p className="text-sm text-muted-foreground">
        Nhập tên đăng nhập để truy cập quản lý tài sản
      </p>

      <SignInForm initialMessage={params?.message} />
    </div>
  )
}
