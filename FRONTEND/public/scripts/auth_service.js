/**
 * AMÉM IA - AUTH SERVICE (Protocolo Sumaúma)
 * Responsibility: Handle Login, Signup, and Session Management with Supabase.
 */

import { supabase } from './supabase_client.js'

export const AuthService = {
    /**
     * CADASTRO ELITE
     */
    async signUp(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        })

        if (error) throw error
        return data
    },

    /**
     * LOGIN ELITE
     */
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error
        return data
    },

    /**
     * LOGOUT
     */
    async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    /**
     * OBTER SESSÃO ATUAL
     */
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        return session
    },

    /**
     * SALVAR NÍVEL ESPIRITUAL (Pós-Quiz)
     */
    async updateSpiritualLevel(level) {
        const user = (await supabase.auth.getUser()).data.user
        if (!user) return

        const { error } = await supabase
            .from('profiles')
            .update({ spiritual_level: level, updated_at: new Date() })
            .eq('id', user.id)

        if (error) throw error
    }
}
