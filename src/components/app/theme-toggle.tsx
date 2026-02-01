
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'

function getThemeFromDom(): Theme {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    try {
        localStorage.setItem('theme', theme)
    } catch {
        // ignore
    }
}

export function ThemeSwitch({ className }: { className?: string }) {
    const [theme, setTheme] = useState<Theme>('light')

    useEffect(() => {
        setTheme(getThemeFromDom())

        const onStorage = (e: StorageEvent) => {
            if (e.key !== 'theme') return
            setTheme(getThemeFromDom())
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    const nextTheme = useMemo<Theme>(() => (theme === 'dark' ? 'light' : 'dark'), [theme])

    const isDark = theme === 'dark'

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
            onClick={() => {
                applyTheme(nextTheme)
                setTheme(nextTheme)
            }}
            className={cn(
                'group relative inline-flex h-10 w-[86px] items-center rounded-full p-1 transition-all',
                'ring-1 ring-border/60 bg-background/70 backdrop-blur',
                'shadow-sm hover:shadow-md active:scale-[0.98]',
                'before:absolute before:inset-0 before:rounded-full before:opacity-0 before:transition-opacity',
                'before:[background:radial-gradient(60%_100%_at_20%_0%,rgba(16,185,129,0.45)_0%,rgba(16,185,129,0)_55%),radial-gradient(50%_80%_at_90%_20%,rgba(52,211,153,0.35)_0%,rgba(52,211,153,0)_60%)]',
                'hover:before:opacity-100',
                className,
            )}
        >
            {/* Track accents */}
            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/15 via-transparent to-emerald-500/15" />

            {/* Left icon */}
            <span className={cn('relative z-10 ml-1 flex h-7 w-7 items-center justify-center transition-opacity', isDark ? 'opacity-40' : 'opacity-100')}>
                <Sun className="h-4 w-4" />
            </span>

            {/* Thumb */}
            <span
                className={cn(
                    'pointer-events-none absolute top-1 z-20 flex h-8 w-8 items-center justify-center rounded-full',
                    'bg-gradient-to-b from-white to-white/80 text-emerald-800 shadow-[0_6px_18px_rgba(0,0,0,0.25)]',
                    'ring-1 ring-black/5 transition-transform duration-300 ease-out',
                    isDark ? 'translate-x-[46px]' : 'translate-x-1',
                )}
            >
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </span>

            {/* Right icon */}
            <span className={cn('relative z-10 ml-auto mr-1 flex h-7 w-7 items-center justify-center transition-opacity', isDark ? 'opacity-100' : 'opacity-40')}>
                <Moon className="h-4 w-4" />
            </span>
        </button>
    )
}
