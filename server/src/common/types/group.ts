import { User } from "@prisma/client";
import { z } from "zod";

// Create Group
export const CreateGroup = z.object({
    name: z.string().min(1, "Group name is required").max(100, "Group name too long"),
    teamId: z.string().min(1, "Team ID is required"),
});

export type CreateGroupDto = {
    name: string;
    teamId: string;
    createdBy: User;
};

// Update Group
export const UpdateGroup = z.object({
    name: z.string().min(1, "Group name is required").max(100, "Group name too long").optional(),
});

export type UpdateGroupDto = {
    groupId: string;
    name?: string;
    updatedBy: User;
};

// Get Groups by Team
export const GetGroupsByTeam = z.object({
    teamId: z.string().min(1, "Team ID is required"),
});

export type GetGroupsByTeamDto = {
    teamId: string;
    currentUser: User;
};

// Add User to Group
export const AddUserToGroup = z.object({
    userId: z.string().min(1, "User ID is required"),
});

export type AddUserToGroupDto = {
    userId: string;
    groupId: string;
    addedBy: User;
};

// Remove User from Group
export const RemoveUserFromGroup = z.object({
    userId: z.string().min(1, "User ID is required"),
});

export type RemoveUserFromGroupDto = {
    userId: string;
    groupId: string;
    removedBy: User;
};

// Get Group Members
export const GetGroupMembers = z.object({
    groupId: z.string().min(1, "Group ID is required"),
});

export type GetGroupMembersDto = {
    groupId: string;
    currentUser: User;
};

// Delete Group
export type DeleteGroupDto = {
    groupId: string;
    deletedBy: User;
};

// Get Group Roles
export const GetGroupRoles = z.object({
    groupId: z.string().min(1, "Group ID is required"),
});

export type GetGroupRolesDto = {
    groupId: string;
    currentUser: User;
};

// Response Types
export type GroupWithMembers = {
    id: string;
    name: string;
    teamId: string;
    createdAt: Date;
    updatedAt: Date;
    userGroups: Array<{
        id: string;
        user: {
            id: string;
            name: string | null;
            email: string;
        };
    }>;
    groupRoles: Array<{
        id: string;
        role: {
            id: string;
            name: string;
            description: string | null;
        };
    }>;
};

export type GroupWithDetails = {
    id: string;
    name: string;
    teamId: string;
    createdAt: Date;
    updatedAt: Date;
    team: {
        id: string;
        name: string;
        tenantId: string;
    };
    userGroups: Array<{
        id: string;
        user: {
            id: string;
            name: string | null;
            email: string;
        };
    }>;
    groupRoles: Array<{
        id: string;
        role: {
            id: string;
            name: string;
            description: string | null;
        };
    }>;
};

export const GroupIdParams = z.object({
    groupId: z.string(),
});

export const GroupUserIdParams = z.object({
    groupId: z.string(),
    userId: z.string(),
});
