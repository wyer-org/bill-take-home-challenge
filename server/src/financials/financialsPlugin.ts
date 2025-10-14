import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { cookie } from "@elysiajs/cookie";
import { FinancialsService } from "./financialsService";
import {
    CreateTransaction,
    UpdateTransaction,
    GetTransactionById,
    DeleteTransaction,
    TransactionIdParams,
    GroupIdParams,
} from "../common/types/financials";

const financialsService = new FinancialsService();

export const financialsPlugin = new Elysia({ prefix: "/financials" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))

    // Create transaction
    .post(
        "/",
        async ({ body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const transaction = await financialsService.createTransaction({
                    ...body,
                    createdBy: user,
                });

                return status(201, {
                    message: "Transaction created successfully",
                    data: transaction,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            body: CreateTransaction,
        }
    )
    // Get transactions by group
    .get(
        "/group/:groupId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const transactions = await financialsService.getTransactionsByGroup({
                    groupId: params.groupId,
                    currentUser: user,
                });

                return status(200, { data: transactions });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: GroupIdParams,
        }
    )
    // Get transaction by ID
    .post(
        "/:transactionId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const transaction = await financialsService.getTransactionById({
                    transactionId: params.transactionId,
                    groupId: body.groupId,
                    currentUser: user,
                });

                return status(200, { data: transaction });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: TransactionIdParams,
            body: GetTransactionById,
        }
    )
    // Update transaction
    .put(
        "/:transactionId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const updatedTransaction = await financialsService.updateTransaction({
                    transactionId: params.transactionId,
                    ...body,
                    updatedBy: user,
                });

                return status(200, {
                    message: "Transaction updated successfully",
                    data: updatedTransaction,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: TransactionIdParams,
            body: UpdateTransaction,
        }
    )
    // Delete transaction
    .delete(
        "/:transactionId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await financialsService.deleteTransaction({
                    transactionId: params.transactionId,
                    groupId: body.groupId,
                    deletedBy: user,
                });

                return status(200, {
                    message: "Transaction deleted successfully",
                    data: result,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: TransactionIdParams,
            body: DeleteTransaction,
        }
    );
