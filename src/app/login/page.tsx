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
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute right-0 top-0 -z-10 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute left-0 bottom-0 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <HistoryBackIconButton fallbackHref="/" />
            <span className="text-sm font-medium">Back</span>
          </div>
          <ThemeSwitch />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pb-14 sm:px-6 lg:grid-cols-2 lg:items-center">
        {/* Left panel - Glassmorphic details */}
        <div className="hidden lg:block space-y-8">
          <div>
            <Badge className="w-fit rounded-full px-3 py-1 mb-4 border-primary/20 bg-primary/10 text-primary" variant="secondary">EntryDesk v2.0</Badge>
            <h1 className="text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Manage tournaments <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">like a pro.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
              The complete toolkit for martial arts events.
              <span className="block mt-2">Join 500+ dojos and organizers streamlining their workflow today.</span>
            </p>
          </div>

          <div className="grid gap-4">
            <div className="glass rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Lightning Fast</div>
                  <div className="text-sm text-muted-foreground">Optimized for speed and efficiency.</div>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Secure & Reliable</div>
                  <div className="text-sm text-muted-foreground">Your data is safe with enterprise-grade security.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth card - Glassmorphic */}
        <div className="relative">
          {/* Card Glow */}
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary to-emerald-500 opacity-20 blur-xl" />

          <Card className="w-full max-w-md justify-self-center border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl relative">
            <CardHeader className="space-y-2 text-center pb-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-lg shadow-primary/20 mb-4">
                <span className="text-lg font-bold">ED</span>
              </div>
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>Enter your details to access your dashboard</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 pt-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/50 rounded-xl">
                  <TabsTrigger value="login" className="rounded-lg">Login</TabsTrigger>
                  <TabsTrigger value="register" className="rounded-lg">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form action={login}>
                    <NavigationOnPending title="Please wait while we log you in" />
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors h-11" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <Link href="#" className="text-xs text-muted-foreground hover:text-primary">Forgot password?</Link>
                        </div>
                        <Input id="password" name="password" type="password" required className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors h-11" />
                      </div>
                      <PendingButton type="submit" className="w-full bg-primary hover:bg-primary/90 h-11 text-base shadow-lg shadow-primary/20" pendingText="Signing in...">
                        Sign in
                      </PendingButton>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form action={signup}>
                    <NavigationOnPending title="Creating your account" />
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First name</Label>
                          <Input id="first-name" name="first_name" placeholder="John" required className="bg-background/50 h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last name</Label>
                          <Input id="last-name" name="last_name" placeholder="Doe" required className="bg-background/50 h-11" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required className="bg-background/50 h-11" />
                      </div>
                      <PendingButton type="submit" className="w-full bg-primary hover:bg-primary/90 h-11 text-base shadow-lg shadow-primary/20" pendingText="Creating account...">
                        Create Account
                      </PendingButton>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <form action={loginWithGoogle}>
                <NavigationOnPending title="Connecting to Google" />
                <PendingButton variant="outline" type="submit" className="w-full hover:bg-accent/10 h-11 border-input/50 bg-background/50" pendingText="Opening Google...">
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
    </div>
  )
}
