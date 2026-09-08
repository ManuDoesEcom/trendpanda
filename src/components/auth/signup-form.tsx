"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Loader2, Radar } from "lucide-react"
import { signup, type AuthActionState } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const initialState: AuthActionState = { error: null }

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <Link href="/" className="mx-auto mb-2 flex items-center gap-2 font-heading text-sm font-semibold">
          <Radar className="size-4 text-primary" />
          TrendPanda
        </Link>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Start finding winning products in minutes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" type="text" placeholder="Jamie Rivera" autoComplete="name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@store.com" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" minLength={8} />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={isPending} className="mt-1">
            {isPending && <Loader2 className="animate-spin" />}
            Create account
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-foreground underline underline-offset-4">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
