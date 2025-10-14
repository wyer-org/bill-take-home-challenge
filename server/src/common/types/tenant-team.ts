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
    tenantId: z.uuid().min(1),
});

export type CreateTeamDto = {
    name: string;
    tenantId: string;
    createdBy: User;
};

export const GetTeamsByTenant = z.object({
    tenantId: z.uuid().min(1),
});

export type GetTeamsByTenantDto = {
    tenantId: string;
    currentUser: User;
};

export const AssignUserToTenant = z.object({
    userId: z.uuid(),
    tenantId: z.uuid(),
});

export type AssignUserToTenantDto = {
    userId: string;
    tenantId: string;
    assignedBy: User;
};

export const RemoveUserFromTenant = z.object({
    userId: z.uuid(),
    tenantId: z.uuid(),
});

export type RemoveUserFromTenantDto = {
    userId: string;
    tenantId: string;
    removedBy: User;
};

export const DeleteTenant = z.object({
    tenantId: z.uuid(),
});

export type DeleteTenantDto = {
    tenantId: string;
    deletedBy: User;
};

export type GetTenantsByCurrentUserDto = {
    currentUser: User;
};

export const GetTeamsForTenant = z.object({
    tenantId: z.uuid(),
});

export type GetTeamsForTenantDto = {
    tenantId: string;
    currentUser: User;
};

export const UpdateTenant = z.object({
    id: z.uuid(),
    name: z.string(),
});

export const UpdateTenantBody = z.object({
    name: z.string().min(1, { message: "Tenant name is required" }),
});

export type DeleteTeamDto = {
    teamId: string;
    deletedBy: User;
};

export const UpdateTeamBody = z.object({
    name: z.string().min(1, { message: "Team name is required" }),
});

export type UpdateTeamDto = {
    teamId: string;
    name: string;
    updatedBy: User;
};

export const TenantIdParams = z.object({
    tenantId: z.uuid(),
});

export const TeamIdParams = z.object({
    teamId: z.uuid(),
});

export const AssignUserToTeam = z.object({
    userId: z.uuid(),
    teamId: z.uuid(),
});

export type AssignUserToTeamDto = {
    userId: string;
    teamId: string;
    assignedBy: User;
};

export const GetTenantUsersParams = z.object({
    tenantId: z.uuid(),
});

export type GetTenantUsersDto = {
    tenantId: string;
    currentUser: User;
};
