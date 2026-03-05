/**
 * AMÉM IA - AUTH SERVICE (Protocolo Sumaúma)
 * Responsibility: Handle Login, Signup, and Session Management with Supabase.
 */

import { supabase } from './supabase_client.js'

export const AuthService = {
    /**
     * JORNADA UNGIDA (CADASTRO)
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

        // [🛡️] QA FIX: Salvar e-mail e nome no perfil para busca posterior pelo Webhook
        await supabase
            .from('profiles')
            .insert([
                { id: data.user.id, full_name: fullName, email: email }
            ])

        return data
    },

    /**
     * ACESSO UNGIDO (LOGIN)
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
     * OBTER PERFIL COMPLETO
     */
    async getProfile() {
        const user = (await supabase.auth.getUser()).data.user
        if (!user) return { data: null, error: 'No user session' }

        return await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
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
