'use client'

import { Button } from '@/components/ui/button'
import { useAppNavigation } from '@/components/app/navigation-provider'

export function SignOutForm() {
    const { beginNavigation } = useAppNavigation()

    return (
        <form
            action="/auth/signout"
            method="post"
            onSubmit={() => beginNavigation({ title: 'Please wait while we log you out' })}
        >
            <Button variant="outline" size="sm" className="w-full">
                Sign Out
            </Button>
        </form>
    )
}
