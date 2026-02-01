import { KarateLoader } from '@/components/ui/karate-loader'

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/40">
            <KarateLoader title="Loading entries..." />
        </div>
    )
}
