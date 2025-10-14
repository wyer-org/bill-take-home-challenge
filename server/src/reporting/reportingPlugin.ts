import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { cookie } from "@elysiajs/cookie";
import { ReportingService } from "./reportingService";
import {
    CreateReport,
    UpdateReport,
    GetReportById,
    DeleteReport,
    ReportIdParams,
    GroupIdParams,
} from "../common/types/reporting";

const reportingService = new ReportingService();

export const reportingPlugin = new Elysia({ prefix: "/reporting" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))

    // Create report
    .post(
        "/",
        async ({ body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const report = await reportingService.createReport({
                    ...body,
                    createdBy: user,
                });

                return status(201, {
                    message: "Report created successfully",
                    data: report,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            body: CreateReport,
        }
    )

    // Get reports by group (New endpoint)
    .get(
        "/group/:groupId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const reports = await reportingService.getReportsByGroup({
                    groupId: params.groupId,
                    currentUser: user,
                });

                return status(200, { data: reports });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: GroupIdParams,
        }
    )

    // Get report by ID (Changed to POST to accept groupId in body)
    .post(
        "/:reportId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const report = await reportingService.getReportById({
                    reportId: params.reportId,
                    groupId: body.groupId,
                    currentUser: user,
                });

                return status(200, { data: report });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: ReportIdParams,
            body: GetReportById,
        }
    )

    // Update report
    .put(
        "/:reportId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const updatedReport = await reportingService.updateReport({
                    reportId: params.reportId,
                    ...body,
                    updatedBy: user,
                });

                return status(200, {
                    message: "Report updated successfully",
                    data: updatedReport,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: ReportIdParams,
            body: UpdateReport,
        }
    )

    // Delete report
    .delete(
        "/:reportId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await reportingService.deleteReport({
                    reportId: params.reportId,
                    groupId: body.groupId,
                    deletedBy: user,
                });

                return status(200, {
                    message: "Report deleted successfully",
                    data: result,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: ReportIdParams,
            body: DeleteReport,
        }
    );
