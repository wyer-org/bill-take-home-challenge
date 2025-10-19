import { prisma } from "../db/client";
import { RegisterUserDto } from "../common/types/user";
import { User, UserType } from "@prisma/client";
import {
    getCurrentTimePlusMinutes,
    getCurrentTimePlusMonths,
    Time,
    isExpired,
} from "../utils/timeUtil";
import { assertUserIsAdmin } from "../guards/assertions";

export class AuthService {
    async registerUser(user: RegisterUserDto) {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: user.email,
            },
        });

        if (existingUser) {
            return { user: null, success: false, message: "User already exists" };
        }

        const newUser = await prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
            },
        });

        return { user: newUser, success: true, message: "User successfully registerd" };
    }

    async createUserMagicLink({ userId }: { userId: string }) {
        const expiresAt = getCurrentTimePlusMinutes(Time.FIFTEEN_MINUTES);

        const magicLink = await prisma.magicLink.create({
            data: {
                userId,
                expiresAt,
            },
        });

        if (!magicLink) {
            return {
                success: false,
                authUrl: "",
            };
        }

        const authUrl = `${process.env.CLIENT_URL}/auth/verify?token=${magicLink.id}`;

        console.log(authUrl);

        return authUrl;
    }

    async createSession({ userId }: { userId: string }) {
        const expiresAt = getCurrentTimePlusMonths(Time.THREE_MONTHS);

        const session = await prisma.userSession.create({
            data: {
                userId,
                expiresAt,
            },
        });

        return session;
    }

    async removeSession({ sessionId }: { sessionId: string }) {
        const result = await prisma.userSession.deleteMany({ where: { id: sessionId } });
        return {
            success: result.count > 0,
        };
    }

    async validateMagicLink({ token }: { token: string }) {
        const magicLink = await prisma.magicLink.findUnique({
            where: { id: token, isUsed: false },
            include: { user: true },
        });

        if (!magicLink) return { isValid: false, user: null, message: "Token is expired" };

        if (!magicLink.user.isVerified) {
            return {
                isValid: false,
                user: magicLink?.user,
                message: "User is not verified. Contact Admin",
            };
        }

        if (isExpired(magicLink.expiresAt)) {
            return {
                isValid: false,
                user: magicLink.user,
                message: "Token is expired. Please renew",
            };
        }

        await prisma.magicLink.update({ where: { id: token }, data: { isUsed: true } });

        return { isValid: true, user: magicLink.user };
    }
}
