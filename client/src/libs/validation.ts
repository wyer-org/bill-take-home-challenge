export function validateIsEmail(email: string) {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) || `${email} is not a valid email`;
}
