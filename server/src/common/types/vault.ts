import { z } from "zod";
import { User } from "@prisma/client";

// Create Vault
export const CreateVault = z.object({
    name: z.string().min(1, "Vault name is required"),
    value: z.string().min(1, "Vault value is required"),
    teamId: z.string().min(1, "Team ID is required"),
    groupId: z.string().min(1, "Group ID is required"),
});

export type CreateVaultDto = {
    name: string;
    value: string;
    teamId: string;
    groupId: string;
    createdBy: User;
};

// Update Vault
export const UpdateVault = z.object({
    name: z.string().optional(),
    value: z.string().optional(),
    groupId: z.string().min(1, "Group ID is required"),
});

export type UpdateVaultDto = {
    vaultId: string;
    name?: string;
    value?: string;
    groupId: string;
    updatedBy: User;
};

// Get Vaults by Team
export const GetVaultsByTeam = z.object({
    teamId: z.string().min(1, "Team ID is required"),
});

export type GetVaultsByTeamDto = {
    teamId: string;
    currentUser: User;
};

// Get Vaults by Group
export const GetVaultsByGroup = z.object({
    groupId: z.string().min(1, "Group ID is required"),
});

export type GetVaultsByGroupDto = {
    groupId: string;
    currentUser: User;
};

// Get Vaults by Tenant
export const GetVaultsByTenant = z.object({
    tenantId: z.string().min(1, "Tenant ID is required"),
});

export type GetVaultsByTenantDto = {
    tenantId: string;
    currentUser: User;
};

// Get Vault by ID
export const GetVaultById = z.object({
    vaultId: z.string().min(1, "Vault ID is required"),
    groupId: z.string().min(1, "Group ID is required"),
});

export type GetVaultByIdDto = {
    vaultId: string;
    groupId: string;
    currentUser: User;
};

// Delete Vault
export const DeleteVault = z.object({
    vaultId: z.string().min(1, "Vault ID is required"),
    groupId: z.string().min(1, "Group ID is required"),
});

export type DeleteVaultDto = {
    vaultId: string;
    groupId: string;
    deletedBy: User;
};

// Parameter types for API routes
export const VaultIdParams = z.object({
    vaultId: z.string(),
});

export const TeamIdParams = z.object({
    teamId: z.string(),
});

export const TenantIdParams = z.object({
    tenantId: z.string(),
});

export const GroupIdParams = z.object({
    groupId: z.string(),
});
