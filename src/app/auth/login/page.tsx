import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Log in — TrendPanda",
}

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-16">
      <LoginForm />
    </div>
  )
}
