"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session, LoginCredentials } from '@/lib/auth'
import * as authLib from '@/lib/auth'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Check session on mount
    useEffect(() => {
        const session = authLib.getSession()
        if (session) {
            setUser(session.user)
        }
        setIsLoading(false)
    }, [])

    const login = async (credentials: LoginCredentials) => {
        try {
            const session = await authLib.login(credentials)
            setUser(session.user)
            router.push('/dashboard')
        } catch (error) {
            throw error
        }
    }

    const logout = () => {
        authLib.logout()
        setUser(null)
        router.push('/sign-in')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
