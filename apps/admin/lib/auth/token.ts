import Cookies from 'js-cookie'

const TOKEN_KEY = 'ajar_admin_token'
const USER_KEY = 'ajar_admin_user'
const TEMP_TOKEN_KEY = 'ajar_admin_temp_token'

export const tokenManager = {
    // Get token from cookies
    getToken: (): string | null => {
        if (typeof window === 'undefined') return null
        return Cookies.get(TOKEN_KEY) || null
    },

    // Set token in cookies
    setToken: (token: string, days: number = 7) => {
        Cookies.set(TOKEN_KEY, token, { expires: days, secure: true, sameSite: 'strict' })
    },

    // Remove token from cookies
    removeToken: () => {
        Cookies.remove(TOKEN_KEY)
    },

    // Get temporary token (for password reset)
    getTempToken: (): string | null => {
        if (typeof window === 'undefined') return null
        console.log(TEMP_TOKEN_KEY)
        return Cookies.get(TEMP_TOKEN_KEY) || null
    },

    // Set temporary token
    setTempToken: (token: string, minutes: number = 30) => {
        const expires = minutes / (24 * 60) // Convert minutes to days
        Cookies.set(TEMP_TOKEN_KEY, token, { expires, secure: true, sameSite: 'strict' })
    },

    // Remove temporary token
    removeTempToken: () => {
        // Cookies.remove(TEMP_TOKEN_KEY)
    },

    // Get user from cookies
    getUser: () => {
        if (typeof window === 'undefined') return null
        const user = Cookies.get(USER_KEY)
        return user ? JSON.parse(user) : null
    },

    // Set user in cookies
    setUser: (user: any, days: number = 7) => {
        Cookies.set(USER_KEY, JSON.stringify(user), { expires: days, secure: true, sameSite: 'strict' })
    },

    // Remove user from cookies
    removeUser: () => {
        Cookies.remove(USER_KEY)
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return !!tokenManager.getToken()
    },

    // Clear all auth data
    clearAuth: () => {
        tokenManager.removeToken()
        tokenManager.removeUser()
        tokenManager.removeTempToken()
    },
}

