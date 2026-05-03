export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTPInRedis = async (email: string, otp: string, redis: any) => {
    const normalizedEmail = normalizeEmail(email);
    const otpKey = `otp:${normalizedEmail}`;
    const attemptsKey = `otp:attempts:${normalizedEmail}`;

    await redis.set(otpKey, otp, "EX", 600);
    await redis.set(attemptsKey, "0", "EX", 600);
};

export const verifyOTPFromRedis = async (email: string, otp: string, redis: any): Promise<boolean> => {
    const normalizedEmail = normalizeEmail(email);
    const otpKey = `otp:${normalizedEmail}`;
    const attemptsKey = `otp:attempts:${normalizedEmail}`;

    const attempts = await redis.get(attemptsKey);
    if (attempts && parseInt(attempts) >= 5) {
        return false;
    }

    const storedOTP = await redis.get(otpKey);

    if (!storedOTP) {
        return false;
    }

    if (storedOTP === otp) {
        await redis.del(otpKey);
        await redis.del(attemptsKey);
        return true;
    }

    await redis.incr(attemptsKey);
    return false;
};

export const deleteOTPFromRedis = async (email: string, redis: any) => {
    const normalizedEmail = normalizeEmail(email);
    const otpKey = `otp:${normalizedEmail}`;
    const attemptsKey = `otp:attempts:${normalizedEmail}`;

    await redis.del(otpKey);
    await redis.del(attemptsKey);
};
