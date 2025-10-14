import { prisma } from "../db/client";
import { User, UserType } from "@prisma/client";
import {
    CreateReportDto,
    UpdateReportDto,
    GetReportsByTeamDto,
    GetReportsByGroupDto,
    GetReportsByTenantDto,
    GetReportByIdDto,
    DeleteReportDto,
} from "../common/types/reporting";
import { assertAdminOrTeamMember } from "../guards/assertions";
import { assertUserIsVerified } from "../guards/assertUserIsVerified";
import { Action, Module } from "@prisma/client";

export class ReportingService {
    async createReport(data: CreateReportDto) {
        const { title, content, teamId, groupId, createdBy } = data;

        assertUserIsVerified({ user: createdBy });

        // Check if user has permission to create reports in this specific group
        await this.assertUserHasPermissionInGroup(
            createdBy,
            groupId,
            Module.REPORTING,
            Action.CREATE
        );

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

        // Create report
        const report = await prisma.report.create({
            data: {
                title,
                content,
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

        return report;
    }

    async getReportsByGroup(data: GetReportsByGroupDto) {
        const { groupId, currentUser } = data;

        assertUserIsVerified({ user: currentUser });

        // Check if user has permission to read reports in this specific group
        await this.assertUserHasPermissionInGroup(
            currentUser,
            groupId,
            Module.REPORTING,
            Action.READ
        );

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

        const reports = await prisma.report.findMany({
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

        return reports;
    }

    async getReportById(data: GetReportByIdDto) {
        const { reportId, groupId, currentUser } = data;

        assertUserIsVerified({ user: currentUser });

        // Check if user has permission to read reports in this specific group
        await this.assertUserHasPermissionInGroup(
            currentUser,
            groupId,
            Module.REPORTING,
            Action.READ
        );

        // Check if user belongs to this group
        await this.assertUserBelongsToGroup(currentUser.id, groupId);

        const report = await prisma.report.findUnique({
            where: { id: reportId },
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

        if (!report) {
            throw new Error("Report not found");
        }

        // Verify the report belongs to the same team and group
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        if (report.teamId !== group.teamId || report.groupId !== groupId) {
            throw new Error("Report does not belong to the specified group's team or group");
        }

        return report;
    }

    async updateReport(data: UpdateReportDto) {
        const { reportId, title, content, groupId, updatedBy } = data;

        assertUserIsVerified({ user: updatedBy });

        // Check if user has permission to update reports in this specific group
        await this.assertUserHasPermissionInGroup(
            updatedBy,
            groupId,
            Module.REPORTING,
            Action.UPDATE
        );

        // Check if user belongs to this group
        await this.assertUserBelongsToGroup(updatedBy.id, groupId);

        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: {
                team: true,
            },
        });

        if (!report) {
            throw new Error("Report not found");
        }

        // Verify the report belongs to the same team and group
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        if (report.teamId !== group.teamId || report.groupId !== groupId) {
            throw new Error("Report does not belong to the specified group's team or group");
        }

        const updatedReport = await prisma.report.update({
            where: { id: reportId },
            data: {
                ...(title && { title }),
                ...(content && { content }),
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

        return updatedReport;
    }

    async deleteReport(data: DeleteReportDto) {
        const { reportId, groupId, deletedBy } = data;

        assertUserIsVerified({ user: deletedBy });

        // Check if user has permission to delete reports in this specific group
        await this.assertUserHasPermissionInGroup(
            deletedBy,
            groupId,
            Module.REPORTING,
            Action.DELETE
        );

        // Check if user belongs to this group
        await this.assertUserBelongsToGroup(deletedBy.id, groupId);

        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: {
                team: true,
            },
        });

        if (!report) {
            throw new Error("Report not found");
        }

        // Verify the report belongs to the same team and group
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        if (report.teamId !== group.teamId || report.groupId !== groupId) {
            throw new Error("Report does not belong to the specified group's team or group");
        }

        // Check if user is the creator or admin
        if (deletedBy.userType !== UserType.ADMIN && report.userId !== deletedBy.id) {
            throw new Error("Unauthorized: Only the creator or admin can delete this report");
        }

        await prisma.report.delete({
            where: { id: reportId },
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
