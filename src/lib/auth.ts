// Authentication utilities
// Hardcoded credentials: admin/admin
// Session expiry: 7 days

export interface User {
    username: string
    role: 'admin' | 'user'
}

export interface Session {
    user: User
    token: string
    expiresAt: number // timestamp
}

export interface LoginCredentials {
    email: string
    password: string
}

const STORAGE_KEY = 'auth_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

// Hardcoded credentials
const VALID_CREDENTIALS = {
    email: 'admin',
    password: 'admin',
}

/**
 * Mock API login - validates credentials
 */
export async function login(credentials: LoginCredentials): Promise<Session> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Validate credentials
    if (
        credentials.email === VALID_CREDENTIALS.email &&
        credentials.password === VALID_CREDENTIALS.password
    ) {
        const user: User = {
            username: 'admin',
            role: 'admin',
        }

        const session: Session = {
            user,
            token: generateToken(),
            expiresAt: Date.now() + SESSION_DURATION,
        }

        // Save to localStorage
        saveSession(session)

        return session
    }

    throw new Error('Invalid credentials')
}

/**
 * Generate a simple token (not cryptographically secure - for demo only)
 */
function generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

/**
 * Save session to localStorage
 */
export function saveSession(session: Session): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    }
}

/**
 * Get session from localStorage
 */
export function getSession(): Session | null {
    if (typeof window === 'undefined') return null

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return null

        const session: Session = JSON.parse(stored)

        // Check if session is expired
        if (Date.now() > session.expiresAt) {
            clearSession()
            return null
        }

        return session
    } catch (error) {
        console.error('Failed to parse session:', error)
        clearSession()
        return null
    }
}

/**
 * Clear session from localStorage
 */
export function clearSession(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getSession() !== null
}

/**
 * Logout - clear session
 */
export function logout(): void {
    clearSession()
}
