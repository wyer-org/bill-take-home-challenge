import { UpdateUserProfileDto } from "../common/types/user";
import { prisma } from "../db/client";
import { User, UserType } from "@prisma/client";
import { assertUserIsAdmin } from "../guards/assertions";

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

    async getUserProfile({ user }: { user: User }) {
        const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                tenant: true,
                team: true,
                userGroups: {
                    include: {
                        group: true,
                    },
                },
            },
        });

        return existingUser;
    }

    async getUnverifiedUsers() {
        const users = await prisma.user.findMany({ where: { isVerified: false } });
        return users;
    }

    async updateUserProfile(data: UpdateUserProfileDto) {
        const { userId, name, email, updatedBy } = data;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        if (updatedBy.id !== userId && updatedBy.userType !== UserType.ADMIN) {
            throw new Error("Unauthorized: Can only update your own profile or be an admin");
        }

        // Check if email is being updated and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                throw new Error("Email already exists");
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
            },
        });

        return updatedUser;
    }

    async updateUserTenant(data: { userId: string; tenantId: string; updatedBy: User }) {
        const { userId, tenantId, updatedBy } = data;

        if (updatedBy.userType !== UserType.ADMIN) {
            throw new Error("Unauthorized: Only admins can move users between tenants");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                tenantId,
                teamId: null,
            },
        });

        return updatedUser;
    }

    async deleteUser(data: { userId: string; deletedBy: User }) {
        const { userId, deletedBy } = data;

        if (deletedBy.userType !== UserType.ADMIN) {
            throw new Error("Unauthorized: Only admins can delete users");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        if (deletedBy.id === userId) {
            throw new Error("Cannot delete your own account, you are an admin");
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return true;
    }

    async verifyUser({ email, verifiedBy }: { email: string; verifiedBy: User }) {
        assertUserIsAdmin({ user: verifiedBy });

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return { success: false, user: null, message: "User not found" };
        }

        await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });

        const updatedUser = await prisma.user.findUnique({ where: { email } });

        return { success: true, user, message: "User successfully verified" };
    }
}
