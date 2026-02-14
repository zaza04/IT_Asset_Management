"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "next-themes"
import { updateProfileSettings, getProfile } from "@/app/actions/profile"

export function ThemeSyncProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth()
    const { theme, setTheme } = useTheme()
    const isSyncedRef = useRef(false)
    const lastSyncedThemeRef = useRef<string | null>(null)

    // 1. Initial Sync: Lấy theme từ DB khi user login
    useEffect(() => {
        if (!isAuthenticated || !user) return

        const syncFromDb = async () => {
            try {
                const { data } = await getProfile()
                if (data?.settings) {
                    const settings = data.settings as Record<string, any>
                    // Nếu DB có theme, apply vào client
                    if (settings.theme) {
                        setTheme(settings.theme)
                        lastSyncedThemeRef.current = settings.theme
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile settings:", error)
            } finally {
                isSyncedRef.current = true
            }
        }

        syncFromDb()
    }, [isAuthenticated, user, setTheme])

    // 2. Sync to DB: Khi user đổi theme (sau khi đã initial sync)
    useEffect(() => {
        if (!isAuthenticated || !isSyncedRef.current) return
        if (!theme) return

        // Nếu theme hiện tại giống theme vừa sync từ DB (hoặc vừa lưu), bỏ qua
        if (theme === lastSyncedThemeRef.current) return

        const timer = setTimeout(async () => {
            try {
                await updateProfileSettings({ theme })
                lastSyncedThemeRef.current = theme
            } catch (error) {
                console.error("Failed to sync theme to DB:", error)
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [theme, isAuthenticated])

    return <>{children}</>
}
