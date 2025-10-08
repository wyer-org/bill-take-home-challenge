import { prisma } from "../db/client";
import { User } from "@prisma/client";

export class UserService {
    async getUserByEmail({ email }: { email: string }) {
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!existingUser) {
            return null;
        }

        return existingUser;
    }

    async getLoggedInUser({ user }: { user: User }) {
        const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                tenant: true,
                team: true,
            },
        });

        return existingUser;
    }
}
