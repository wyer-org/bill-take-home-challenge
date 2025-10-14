import { z } from "zod";
import { User } from "@prisma/client";

// Create Transaction
export const CreateTransaction = z.object({
    amount: z.number().positive("Amount must be positive"),
    description: z.string().min(1, "Description is required"),
    teamId: z.uuid().min(1, "Team ID is required"),
    groupId: z.uuid().min(1, "Group ID is required"),
});

export type CreateTransactionDto = {
    amount: number;
    description: string;
    teamId: string;
    groupId: string;
    createdBy: User;
};

// Update Transaction
export const UpdateTransaction = z.object({
    amount: z.number().positive("Amount must be positive").optional(),
    description: z.string().min(1, "Description is required").optional(),
    groupId: z.uuid().min(1, "Group ID is required"),
});

export type UpdateTransactionDto = {
    transactionId: string;
    amount?: number;
    description?: string;
    groupId: string;
    updatedBy: User;
};

// Get Transactions by Team
export const GetTransactionsByTeam = z.object({
    teamId: z.string().min(1, "Team ID is required"),
});

export type GetTransactionsByTeamDto = {
    teamId: string;
    currentUser: User;
};

// Get Transactions by Group
export const GetTransactionsByGroup = z.object({
    groupId: z.string().min(1, "Group ID is required"),
});

export type GetTransactionsByGroupDto = {
    groupId: string;
    currentUser: User;
};

// Get Transactions by Tenant
export const GetTransactionsByTenant = z.object({
    tenantId: z.string().min(1, "Tenant ID is required"),
});

export type GetTransactionsByTenantDto = {
    tenantId: string;
    currentUser: User;
};

// Get Transaction by ID
export const GetTransactionById = z.object({
    transactionId: z.string().min(1, "Transaction ID is required"),
    groupId: z.uuid().min(1, "Group ID is required"),
});

export type GetTransactionByIdDto = {
    transactionId: string;
    groupId: string;
    currentUser: User;
};

// Delete Transaction
export const DeleteTransaction = z.object({
    transactionId: z.string().min(1, "Transaction ID is required"),
    groupId: z.uuid().min(1, "Group ID is required"),
});

export type DeleteTransactionDto = {
    transactionId: string;
    groupId: string;
    deletedBy: User;
};

// Parameter types for API routes
export const TransactionIdParams = z.object({
    transactionId: z.string(),
});

export const TeamIdParams = z.object({
    teamId: z.string(),
});

export const GroupIdParams = z.object({
    groupId: z.string(),
});

export const TenantIdParams = z.object({
    tenantId: z.string(),
});
