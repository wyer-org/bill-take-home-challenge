import { User } from "@prisma/client";
import z from "zod";

// Create role with permissions
export const CreateRoleForGroup = z.object({
    name: z.string().min(1, "Role name is required"),
    description: z.string().optional(),
    permissionsIds: z.array(z.uuid()).min(1, "At least one permission is required"),
});

export const CreateRoleForGroupParams = z.object({
    groupId: z.uuid().min(1, "Group ID is required"),
});

export type CreateRoleForGroupDto = {
    name: string;
    description: string;
    permissionsIds: string[];
    groupId: string;
    createdBy: User;
};

// Get roles for a  group
export const GetRolesByGroup = z.object({
    groupId: z.uuid().min(1, "Group ID is required"),
});

export type GetRolesByGroupDto = {
    groupId: string;
    currentUser: User;
};

// Remove role from group
export const RemoveRoleFromGroup = z.object({
    groupId: z.string().min(1, "Group ID is required"),
    roleId: z.string().min(1, "Role ID is required"),
});

export type RemoveRoleFromGroupDto = {
    roleId: string;
    groupId: string;
    removedBy: User;
};

// Assign role to group
export const AssignRoleToGroupParams = z.object({
    groupId: z.uuid().min(1, "Group ID is required"),
    roleId: z.uuid().min(1, "Role ID is required"),
});

export type AssignRoleToGroupDto = {
    groupId: string;
    roleId: string;
    assignedBy: User;
};

export const UpdateRole = z.object({
    roleId: z.string().min(1, "Role ID is required"),
    name: z.string().min(1, "Role name is required"),
    description: z.string().optional(),
    permissionsIds: z.array(z.uuid()).min(1, "At least one permission is required"),
});

export type UpdateRoleDto = {
    roleId: string;
    name: string;
    description: string;
    permissionsIds: string[];
    updatedBy: User;
};

export const AddPermissionsToRole = z.object({
    roleId: z.string().min(1, "Role ID is required"),
    permissionIds: z.array(z.uuid()).min(1, "At least one permission is required"),
});

export type AddPermissionsToRoleDto = {
    roleId: string;
    permissionIds: string[];
    addedBy: User;
};

export const RemovePermissionsFromRole = z.object({
    roleId: z.string().min(1, "Role ID is required"),
    permissionIds: z.array(z.uuid()).min(1, "At least one permission is required"),
});

export type RemovePermissionsFromRoleDto = {
    roleId: string;
    permissionIds: string[];
    removedBy: User;
};

export const DeleteRole = z.object({
    roleId: z.string().min(1, "Role ID is required"),
});

export type DeleteRoleDto = {
    roleId: string;
    deletedBy: User;
};
