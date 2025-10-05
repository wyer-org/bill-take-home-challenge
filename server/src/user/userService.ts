import { prisma } from "../db/client";

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
}
