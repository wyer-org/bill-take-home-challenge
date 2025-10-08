import { User } from "@prisma/client";
import z from "zod";

// Remove Role from Group
export const RemoveRoleFromGroup = z.object({
    groupId: z.string().min(1, "Group ID is required"),
    roleId: z.string().min(1, "Role ID is required"),
});

export type RemoveRoleFromGroupDto = {
    roleId: string;
    groupId: string;
    removedBy: User;
};

// Assign Role to Group
export const AssignRoleToGroup = z.object({
    groupId: z.string().min(1, "Group ID is required"),
    roleId: z.string().min(1, "Role ID is required"),
});

export type AssignRoleToGroupDto = {
    groupId: string;
    roleId: string;
    assignedBy: User;
};
