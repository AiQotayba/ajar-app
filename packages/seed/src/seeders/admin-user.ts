import type { ApiInstance } from '@useApi';

/**
 * Create admin user and return authentication token
 */
export async function createAdminUser(api: ApiInstance): Promise<string> {
    try {
        // First, try to login with existing admin
        console.log('  🔍 Checking for existing admin user...');

        const loginResponse = await api.post('/auth/login', {
            phone: '+962791234567',
            password: '123456789',
            role: 'admin'
        });

        if (loginResponse.data?.access_token) {
            console.log('  ✅ Admin user exists, logged in successfully');
            return loginResponse.data.access_token;
        }
    } catch (error) {
        console.log('  ℹ️ Admin user not found, creating new one...');
    }

    // Create new admin user
    console.log('  👤 Creating new admin user...');

    const registerResponse = await api.post('/auth/register', {
        first_name: 'أدمن',
        last_name: 'النظام',
        phone: '+962791234567',
        password: '123456789',
        password_confirmation: '123456789',
        avatar: 'avatars/admin_avatar.jpg'
    });

    if (!registerResponse.data?.data) {
        throw new Error('Failed to create admin user');
    }

    console.log('  ✅ Admin user created successfully');
    console.log('  📱 OTP sent, verifying...');

    // Verify OTP
    const verifyResponse = await api.post('/auth/verify-otp', {
        phone: '+962791234567',
        otp: '123456' // Default OTP for development
    });

    if (!verifyResponse.data?.access_token) {
        throw new Error('Failed to verify admin OTP');
    }

    console.log('  ✅ Admin user verified and logged in');
    return verifyResponse.data.access_token;
}
