import { User } from "@prisma/client";
import z from "zod";

export const CreateTenant = z.object({
    name: z.string().min(1),
});

export type CreateTenantDto = {
    name: string;
    createdBy: User;
};

export const CreateTeam = z.object({
    name: z.string().min(1),
    tenantId: z.string().min(1),
});

export type CreateTeamDto = {
    name: string;
    tenantId: string;
    createdBy: User;
};

export const GetTeamsByTenant = z.object({
    tenantId: z.string().min(1),
});

export type GetTeamsByTenantDto = {
    tenantId: string;
    currentUser: User;
};

export const GetTeamsByTentantParams = z.object({
    tenantId: z.string(),
});

export const AssignUserToTenant = z.object({
    userId: z.string(),
    tenantId: z.string(),
});

export type AssignUserToTenantDto = {
    userId: string;
    tenantId: string;
    assignedBy: User;
};

export const RemoveUserFromTenant = z.object({
    userId: z.string(),
    tenantId: z.string(),
});

export type RemoveUserFromTenantDto = {
    userId: string;
    tenantId: string;
    removedBy: User;
};

export const DeleteTenant = z.object({
    tenantId: z.string(),
});

export type DeleteTenantDto = {
    tenantId: string;
    deletedBy: User;
};

export type GetTenantsByCurrentUserDto = {
    currentUser: User;
};

export const GetTeamsForTenant = z.object({
    tenantId: z.string(),
});

export type GetTeamsForTenantDto = {
    tenantId: string;
    currentUser: User;
};
