'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Github, Mail, Sparkles } from 'lucide-react'

export function SiteFooter() {
    return (
        <footer className="border-t border-emerald-900/30 text-white">
            {/* Green marketing footer */}
            <div className="relative overflow-hidden bg-gradient-to-b from-emerald-700 via-emerald-700 to-emerald-800">
                {/* subtle decorative layers */}
                <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(60%_60%_at_20%_0%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_60%),radial-gradient(50%_50%_at_90%_20%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_55%)]" />
                <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 left-[-10%] h-72 w-72 rounded-full bg-lime-200/10 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
                        {/* Brand + pitch */}
                        <div className="md:col-span-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                                    <span className="text-sm font-semibold tracking-tight">ED</span>
                                </div>
                                <div className="leading-tight">
                                    <div className="text-base font-semibold">EntryDesk</div>
                                    <div className="text-xs text-white/80">Event ops, without the chaos</div>
                                </div>
                            </div>

                            <p className="mt-4 max-w-xl text-sm text-white/85">
                                Build events faster, keep coach workflows clean, and ship exports that are ready for day-of.
                                Simple for teams, powerful for organizers.
                            </p>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Button
                                    asChild
                                    className="bg-white text-emerald-800 hover:bg-white/90"
                                >
                                    <Link href="/login">
                                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                >
                                    <Link href="/#events">Browse public events</Link>
                                </Button>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/80">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
                                    <Sparkles className="h-4 w-4" />
                                    Fast setup • Role-based dashboards • Export ready
                                </span>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="md:col-span-3">
                            <div className="text-sm font-semibold">Explore</div>
                            <ul className="mt-4 space-y-2 text-sm text-white/85">
                                <li>
                                    <Link className="hover:text-white" href="/#features">
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link className="hover:text-white" href="/#events">
                                        Events
                                    </Link>
                                </li>
                                <li>
                                    <Link className="hover:text-white" href="/login">
                                        Login
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="md:col-span-4">
                            <div className="text-sm font-semibold">Contact & Open Source</div>

                            <div className="mt-4 grid gap-3">
                                <a
                                    href="https://github.com/ull0sm/EntryDesk"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-center justify-between gap-3 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 transition-colors hover:bg-white/15"
                                >
                                    <span className="flex items-center gap-2 text-sm">
                                        <Github className="h-4 w-4" />
                                        GitHub
                                    </span>
                                    <span className="text-xs text-white/75 group-hover:text-white">View repo →</span>
                                </a>

                                <a
                                    href="mailto:ullas4101997@gmail.com"
                                    className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 transition-colors hover:bg-white/15"
                                >
                                    <Mail className="h-4 w-4" />
                                    <span className="text-sm">ullas4101997@gmail.com</span>
                                </a>

                                <a
                                    href="mailto:prateekyawagal@gmail.com"
                                    className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 transition-colors hover:bg-white/15"
                                >
                                    <Mail className="h-4 w-4" />
                                    <span className="text-sm">prateekyawagal@gmail.com</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-white/15 pt-6">
                        <div className="flex flex-col gap-3 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
                            <span>© {new Date().getFullYear()} EntryDesk. All rights reserved.</span>
                            <span className="text-xs">Made with Next.js • Supabase • Tailwind</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
