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
