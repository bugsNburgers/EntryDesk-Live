'use client'

export function KarateLoader({
    title = 'Preparing the dojo...',
    subtitle = 'Applying techniques and syncing data',
    progress,
}: {
    title?: string
    subtitle?: string
    progress?: number
}) {
    const safeProgress =
        typeof progress === 'number' ? Math.min(100, Math.max(0, progress)) : undefined

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl">🥋</span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 h-2 w-24 -translate-x-1/2 rounded-full bg-primary/20 ring-1 ring-primary/15">
                        {safeProgress === undefined ? (
                            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-700 shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]" />
                        ) : (
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-700 transition-[width] duration-150 ease-out shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]"
                                style={{ width: `${safeProgress}%` }}
                            />
                        )}
                    </div>
                </div>
                <div>
                    <p className="text-base font-semibold">{title}</p>
                    {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
                </div>
            </div>
        </div>
    )
}
