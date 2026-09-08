"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Loader2, Radar } from "lucide-react"
import { login, type AuthActionState } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const initialState: AuthActionState = { error: null }

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <Link href="/" className="mx-auto mb-2 flex items-center gap-2 font-heading text-sm font-semibold">
          <Radar className="size-4 text-primary" />
          TrendPanda
        </Link>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Log in to keep tracking winning products.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@store.com" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={isPending} className="mt-1">
            {isPending && <Loader2 className="animate-spin" />}
            Log in
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-foreground underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
