import type { Metadata } from "next"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign up — TrendPanda",
}

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-16">
      <SignupForm />
    </div>
  )
}
