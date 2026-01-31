import { KarateLoader } from '@/components/ui/karate-loader'

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm">
            <KarateLoader title="Loading entries..." subtitle="Updating the roster" />
        </div>
    )
}
