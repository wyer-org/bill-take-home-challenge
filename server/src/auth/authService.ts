import { prisma } from "../db/client";
import { RegisterUserDto } from "../common/types/user";
import { User, UserType } from "@prisma/client";
import {
    getCurrentTimePlusMinutes,
    getCurrentTimePlusMonths,
    Time,
    isExpired,
} from "../utils/timeUtil";

export class AuthService {
    async registerUser(user: RegisterUserDto) {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: user.email,
            },
        });

        if (existingUser) {
            return null;
        }

        const newUser = await prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
            },
        });

        return newUser;
    }

    async createUserMagicLink({ userId }: { userId: string }) {
        const expiresAt = getCurrentTimePlusMinutes(Time.FIFTEEN_MINUTES);

        const magicLink = await prisma.magicLink.create({
            data: {
                userId,
                expiresAt,
            },
        });

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

        if (!magicLink) return { isValid: false, user: null };

        if (isExpired(magicLink.expiresAt)) {
            return { isValid: false, user: null };
        }

        await prisma.magicLink.update({ where: { id: token }, data: { isUsed: true } });

        return { isValid: true, user: magicLink.user };
    }

    async validateIsUserAdmin(user: User) {
        return { isAdmin: user.userType === UserType.ADMIN, user };
    }

    // only use this function is the entiy performing the action is an admin user
    //is admin is just to ensure readability and to tell developer not to call function randomly
    async verifyUserByAdmin({
        email,
        isVerifiedByAdmin,
    }: {
        email: string;
        isVerifiedByAdmin: boolean;
    }) {
        if (!isVerifiedByAdmin) {
            return { isVerified: false, user: null };
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return { isVerified: false, user: null };
        }

        await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });

        return { isVerified: true, user };
    }
}
