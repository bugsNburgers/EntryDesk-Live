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

    // Ensure we have a profile row for FK + RLS checks.
    // Supabase Auth does not auto-create rows in public.profiles.
    const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name, email')
        .eq('id', user.id)
        .maybeSingle()

    if (profileError) {
        throw new Error(profileError.message)
    }

    let profile = existingProfile

    if (!profile) {
        const email = user.email
        if (!email) {
            throw new Error('Missing email on user; cannot create profile')
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meta = (user as any)?.user_metadata as any
        const fullName = (meta?.full_name || meta?.name || meta?.display_name || email.split('@')[0]) as string

        const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({ id: user.id, email, full_name: fullName })

        if (createProfileError) {
            throw new Error(createProfileError.message)
        }

        const { data: createdProfile, error: createdProfileError } = await supabase
            .from('profiles')
            .select('id, role, full_name, email')
            .eq('id', user.id)
            .single()

        if (createdProfileError) {
            throw new Error(createdProfileError.message)
        }

        profile = createdProfile
    }

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
