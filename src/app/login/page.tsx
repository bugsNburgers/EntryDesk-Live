import { login, loginWithGoogle, signup } from './actions'
import { Button } from "@/components/ui/button"
import { PendingButton } from "@/components/ui/pending-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavigationOnPending } from '@/components/app/navigation-on-pending'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { HistoryBackIconButton } from '@/components/app/history-back'
import { ThemeSwitch } from '@/components/app/theme-toggle'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <HistoryBackIconButton fallbackHref="/" />
            <span className="text-sm">Back</span>
          </div>
          <ThemeSwitch />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-2 lg:items-center">
        {/* Left panel */}
        <div className="hidden lg:block">
          <Badge className="w-fit" variant="secondary">Welcome</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Sign in to manage events, students, and entries.</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            EntryDesk keeps coach workflows fast and organizer operations clean — approvals, exports, and everything in between.
          </p>

          <div className="mt-8 grid gap-3">
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm font-medium">Clean dashboard</div>
              <div className="mt-1 text-xs text-muted-foreground">Designed like Stripe/Linear — minimal and fast.</div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm font-medium">Instant feedback</div>
              <div className="mt-1 text-xs text-muted-foreground">Smooth loaders and transitions across the app.</div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm font-medium">Role-based experience</div>
              <div className="mt-1 text-xs text-muted-foreground">Coach and organizer views stay focused.</div>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <Card className="w-full max-w-md justify-self-center border bg-background shadow-sm">
          <CardHeader className="space-y-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-semibold">ED</span>
              </div>
              <div className="leading-tight">
                <CardTitle className="text-base font-semibold">EntryDesk</CardTitle>
                <CardDescription className="text-xs">Sign in or create an account</CardDescription>
              </div>
            </Link>
          </CardHeader>

          <CardContent className="grid gap-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form action={login}>
                  <NavigationOnPending title="Please wait while we log you in" />
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>
                    <PendingButton type="submit" className="w-full bg-primary hover:bg-primary/90" pendingText="Signing in...">
                      Sign in with Email
                    </PendingButton>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form action={signup}>
                  <NavigationOnPending title="Please wait while we log you in" />
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" name="first_name" placeholder="John" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" name="last_name" placeholder="Doe" required />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>
                    <PendingButton type="submit" className="w-full bg-primary hover:bg-primary/90" pendingText="Creating account...">
                      Create Account
                    </PendingButton>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <form action={loginWithGoogle}>
              <NavigationOnPending title="Please wait while we log you in" />
              <PendingButton variant="outline" type="submit" className="w-full hover:bg-accent/10" pendingText="Opening Google...">
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Google
              </PendingButton>
            </form>

          </CardContent>
          <CardFooter className="flex justify-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service.
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
