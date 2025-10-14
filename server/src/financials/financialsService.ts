import { prisma } from "../db/client";
import { UserType } from "@prisma/client";
import {
    CreateTransactionDto,
    UpdateTransactionDto,
    GetTransactionsByGroupDto,
    GetTransactionByIdDto,
    DeleteTransactionDto,
} from "../common/types/financials";
import { assertUserIsVerified } from "../guards/assertUserIsVerified";
import { Action, Module } from "@prisma/client";
import {
    assertUserBelongsToGroupOrIsAdmin,
    assertUserHasPermissionInGroup,
    assertUserIsAdminOrBelongsToTeam,
} from "../guards/assertions";

export class FinancialsService {
    // todo: can be refactored such that the user's team us used directly
    // as user should not be able to create a transaction for another team
    async createTransaction(data: CreateTransactionDto) {
        const { amount, description, teamId, groupId, createdBy } = data;

        assertUserIsVerified({ user: createdBy });

        // Check if user belongs to this group
        await assertUserBelongsToGroupOrIsAdmin({ userId: createdBy.id, groupId });

        // Check if user has permission to create transactions in this specific group
        await assertUserHasPermissionInGroup(createdBy, groupId, Module.FINANCIALS, Action.CREATE);

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { tenant: true },
        });

        if (!team) {
            throw new Error("Team not found");
        }

        await assertUserIsAdminOrBelongsToTeam({ teamId, user: createdBy });

        const transaction = await prisma.transaction.create({
            data: {
                amount,
                description,
                tenantId: team.tenantId,
                teamId,
                userId: createdBy.id,
                groupId,
            },
            include: {
                tenant: true,
                team: true,
                createdBy: true,
            },
        });

        return transaction;
    }

    async getTransactionsByGroup(data: GetTransactionsByGroupDto) {
        const { groupId, currentUser } = data;

        assertUserIsVerified({ user: currentUser });

        // Check if user has permission to read transactions in this specific group
        await assertUserHasPermissionInGroup(currentUser, groupId, Module.FINANCIALS, Action.READ);

        // Check if user belongs to this group
        await assertUserBelongsToGroupOrIsAdmin({ userId: currentUser.id, groupId });

        // Get group to get teamId
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        // todo: this is redundant as we already check if user belongs to this group
        // after change to use user's team remove this
        await assertUserIsAdminOrBelongsToTeam({ teamId: group.teamId, user: currentUser });

        const transactions = await prisma.transaction.findMany({
            where: { teamId: group.teamId },
            include: {
                tenant: true,
                team: true,
                createdBy: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return transactions;
    }

    async getTransactionById(data: GetTransactionByIdDto) {
        const { transactionId, groupId, currentUser } = data;

        assertUserIsVerified({ user: currentUser });

        // Check if user has permission to read transactions in this specific group
        await assertUserHasPermissionInGroup(currentUser, groupId, Module.FINANCIALS, Action.READ);

        // Check if user belongs to this group
        await assertUserBelongsToGroupOrIsAdmin({ userId: currentUser.id, groupId });

        // Verify the transaction belongs to the same team as the group
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        // todo: this is redundant as we already check if user belongs to this group
        // after change to use user's team remove this
        await assertUserIsAdminOrBelongsToTeam({ teamId: group.teamId, user: currentUser });

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                tenant: true,
                team: true,
                createdBy: true,
            },
        });

        if (!transaction) {
            throw new Error("Transaction not found");
        }

        if (transaction.teamId !== group.teamId) {
            throw new Error("Transaction does not belong to the specified group's team");
        }

        return transaction;
    }

    async updateTransaction(data: UpdateTransactionDto) {
        const { transactionId, amount, description, groupId, updatedBy } = data;

        assertUserIsVerified({ user: updatedBy });

        // Check if user has permission to update transactions in this specific group
        await assertUserHasPermissionInGroup(updatedBy, groupId, Module.FINANCIALS, Action.UPDATE);

        // Check if user belongs to this group
        await assertUserBelongsToGroupOrIsAdmin({ userId: updatedBy.id, groupId });

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                team: true,
            },
        });

        if (!transaction) {
            throw new Error("Transaction not found");
        }

        // Verify the transaction belongs to the same team as the group
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        if (transaction.teamId !== group.teamId) {
            throw new Error("Transaction does not belong to the specified group's team");
        }

        const updatedTransaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                ...(amount && { amount }),
                ...(description && { description }),
            },
            include: {
                tenant: true,
                team: true,
                createdBy: true,
            },
        });

        return updatedTransaction;
    }

    async deleteTransaction(data: DeleteTransactionDto) {
        const { transactionId, groupId, deletedBy } = data;

        assertUserIsVerified({ user: deletedBy });

        // Check if user has permission to delete transactions in this specific group
        await assertUserHasPermissionInGroup(deletedBy, groupId, Module.FINANCIALS, Action.DELETE);

        // Check if user belongs to this group
        await assertUserBelongsToGroupOrIsAdmin({ userId: deletedBy.id, groupId });

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                team: true,
            },
        });

        if (!transaction) {
            throw new Error("Transaction not found");
        }

        // Verify the transaction belongs to the same team as the group
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { team: true },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        if (transaction.teamId !== group.teamId) {
            throw new Error("Transaction does not belong to the specified group's team");
        }

        // Check if user is the creator or admin
        if (deletedBy.userType !== UserType.ADMIN && transaction.userId !== deletedBy.id) {
            throw new Error("Unauthorized: Only the creator or admin can delete this transaction");
        }

        await prisma.transaction.delete({
            where: { id: transactionId },
        });

        return true;
    }
}
