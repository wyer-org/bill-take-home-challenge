import { z } from "zod";
import { User } from "@prisma/client";

// Create Report
export const CreateReport = z.object({
    title: z.string().min(1, "Report title is required"),
    content: z.string().min(1, "Report content is required"),
    teamId: z.string().min(1, "Team ID is required"),
    groupId: z.string().min(1, "Group ID is required"),
});

export type CreateReportDto = {
    title: string;
    content: string;
    teamId: string;
    groupId: string;
    createdBy: User;
};

// Update Report
export const UpdateReport = z.object({
    title: z.string().min(1, "Report title is required").optional(),
    content: z.string().min(1, "Report content is required").optional(),
    groupId: z.string().min(1, "Group ID is required"),
});

export type UpdateReportDto = {
    reportId: string;
    title?: string;
    content?: string;
    groupId: string;
    updatedBy: User;
};

// Get Reports by Team
export const GetReportsByTeam = z.object({
    teamId: z.string().min(1, "Team ID is required"),
});

export type GetReportsByTeamDto = {
    teamId: string;
    currentUser: User;
};

// Get Reports by Group
export const GetReportsByGroup = z.object({
    groupId: z.string().min(1, "Group ID is required"),
});

export type GetReportsByGroupDto = {
    groupId: string;
    currentUser: User;
};

// Get Reports by Tenant
export const GetReportsByTenant = z.object({
    tenantId: z.string().min(1, "Tenant ID is required"),
});

export type GetReportsByTenantDto = {
    tenantId: string;
    currentUser: User;
};

// Get Report by ID
export const GetReportById = z.object({
    reportId: z.string().min(1, "Report ID is required"),
    groupId: z.string().min(1, "Group ID is required"),
});

export type GetReportByIdDto = {
    reportId: string;
    groupId: string;
    currentUser: User;
};

// Delete Report
export const DeleteReport = z.object({
    reportId: z.string().min(1, "Report ID is required"),
    groupId: z.string().min(1, "Group ID is required"),
});

export type DeleteReportDto = {
    reportId: string;
    groupId: string;
    deletedBy: User;
};

// Parameter types for API routes
export const ReportIdParams = z.object({
    reportId: z.string(),
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
