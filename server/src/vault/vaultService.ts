import { prisma } from "../db/client";
import { User, UserType } from "@prisma/client";
import {
    CreateVaultDto,
    UpdateVaultDto,
    GetVaultsByTeamDto,
    GetVaultsByGroupDto,
    GetVaultsByTenantDto,
    GetVaultByIdDto,
    DeleteVaultDto,
} from "../common/types/vault";
import { assertAdminOrTeamMember } from "../guards/assertions";
import { assertUserIsVerified } from "../guards/assertUserIsVerified";
import { Action, Module } from "@prisma/client";

export class VaultService {
    async createVault(data: CreateVaultDto) {
        const { name, value, teamId, groupId, createdBy } = data;

        assertUserIsVerified({ user: createdBy });

        // Check if user has permission to create vaults in this specific group
        await this.assertUserHasPermissionInGroup(createdBy, groupId, Module.VAULT, Action.CREATE);

        // Check if user belongs to this group
        await this.assertUserBelongsToGroup(createdBy.id, groupId);

        // Get team to get tenantId
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { tenant: true },
        });

        if (!team) {
            throw new Error("Team not found");
        }

        // Create vault
        const vault = await prisma.vault.create({
            data: {
                name,
                value,
                tenantId: team.tenantId,
                teamId,
                groupId,
                userId: createdBy.id,
            },
            include: {
                tenant: true,
                team: true,
                group: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return vault;
    }

    async getVaultsByGroup(data: GetVaultsByGroupDto) {
        const { groupId, currentUser } = data;

        assertUserIsVerified({ user: currentUser });

        // Check if user has permission to read vaults in this specific group
        await this.assertUserHasPermissionInGroup(currentUser, groupId, Module.VAULT, Action.READ);

        // Check if user belongs to this group
        await this.assertUserBelongsToGroup(currentUser.id, groupId);

        // Get group to get teamId
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        const vaults = await prisma.vault.findMany({
            where: { teamId: group.teamId, groupId },
            include: {
                tenant: true,
                team: true,
                group: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return vaults;
    }

    async getVaultById(data: GetVaultByIdDto) {
        const { vaultId, groupId, currentUser } = data;

        assertUserIsVerified({ user: currentUser });

        // Check if user has permission to read vaults in this specific group
        await this.assertUserHasPermissionInGroup(currentUser, groupId, Module.VAULT, Action.READ);

        // Check if user belongs to this group
        await this.assertUserBelongsToGroup(currentUser.id, groupId);

        const vault = await prisma.vault.findUnique({
            where: { id: vaultId },
            include: {
                tenant: true,
                team: true,
                group: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!vault) {
            throw new Error("Vault not found");
        }

        // Verify the vault belongs to the same team and group
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        if (vault.teamId !== group.teamId || vault.groupId !== groupId) {
            throw new Error("Vault does not belong to the specified group's team or group");
        }

        return vault;
    }

    async updateVault(data: UpdateVaultDto) {
        const { vaultId, name, value, groupId, updatedBy } = data;

        assertUserIsVerified({ user: updatedBy });

        // Check if user has permission to update vaults in this specific group
        await this.assertUserHasPermissionInGroup(updatedBy, groupId, Module.VAULT, Action.UPDATE);

        // Check if user belongs to this group
        await this.assertUserBelongsToGroup(updatedBy.id, groupId);

        const vault = await prisma.vault.findUnique({
            where: { id: vaultId },
            include: {
                team: true,
            },
        });

        if (!vault) {
            throw new Error("Vault not found");
        }

        // Verify the vault belongs to the same team and group
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        if (vault.teamId !== group.teamId || vault.groupId !== groupId) {
            throw new Error("Vault does not belong to the specified group's team or group");
        }

        const updatedVault = await prisma.vault.update({
            where: { id: vaultId },
            data: {
                ...(name && { name }),
                ...(value && { value }),
            },
            include: {
                tenant: true,
                team: true,
                group: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return updatedVault;
    }

    async deleteVault(data: DeleteVaultDto) {
        const { vaultId, groupId, deletedBy } = data;

        assertUserIsVerified({ user: deletedBy });

        // Check if user has permission to delete vaults in this specific group
        await this.assertUserHasPermissionInGroup(deletedBy, groupId, Module.VAULT, Action.DELETE);

        // Check if user belongs to this group
        await this.assertUserBelongsToGroup(deletedBy.id, groupId);

        const vault = await prisma.vault.findUnique({
            where: { id: vaultId },
            include: {
                team: true,
            },
        });

        if (!vault) {
            throw new Error("Vault not found");
        }

        // Verify the vault belongs to the same team and group
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        if (vault.teamId !== group.teamId || vault.groupId !== groupId) {
            throw new Error("Vault does not belong to the specified group's team or group");
        }

        // Check if user is the creator or admin
        if (deletedBy.userType !== UserType.ADMIN && vault.userId !== deletedBy.id) {
            throw new Error("Unauthorized: Only the creator or admin can delete this vault");
        }

        await prisma.vault.delete({
            where: { id: vaultId },
        });

        return true;
    }

    // Helper method to check if user has specific permission in a specific group
    private async assertUserHasPermissionInGroup(
        user: User,
        groupId: string,
        module: Module,
        action: Action
    ) {
        if (user.userType === UserType.ADMIN) {
            return; // Admins have all permissions
        }

        const hasPermission = await prisma.userGroup.findFirst({
            where: {
                userId: user.id,
                groupId: groupId,
                group: {
                    groupRoles: {
                        some: {
                            role: {
                                rolePermissions: {
                                    some: {
                                        permission: {
                                            module: module,
                                            action: action,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!hasPermission) {
            throw new Error(
                `Unauthorized: Missing ${action} permission for ${module} in this group`
            );
        }
    }

    // Helper method to check if user belongs to a specific group
    private async assertUserBelongsToGroup(userId: string, groupId: string) {
        const userGroup = await prisma.userGroup.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: groupId,
                },
            },
        });

        if (!userGroup) {
            throw new Error("Unauthorized: User does not belong to this group");
        }
    }
}
