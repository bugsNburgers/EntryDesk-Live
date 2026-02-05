import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'organizer' | 'coach' | 'admin'

export async function getUserProfile() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, full_name, email')
        .eq('id', user.id)
        .single()

    const role = (profile?.role as UserRole) || 'coach'

    return { supabase, user, profile, role }
}

export async function requireRole(
    allowed: UserRole | UserRole[],
    options?: { redirectTo?: string }
) {
    const { supabase, user, profile, role } = await getUserProfile()
    const allowedRoles = Array.isArray(allowed) ? allowed : [allowed]

    if (!allowedRoles.includes(role)) {
        if (options?.redirectTo) {
            redirect(options.redirectTo)
        }
        throw new Error('Unauthorized')
    }

    return { supabase, user, profile, role }
}
