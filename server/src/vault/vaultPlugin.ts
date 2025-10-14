import { Elysia } from "elysia";
import { userFromCookieMiddleware } from "../middlewares/userFromCookieMiddleware";
import { cookie } from "@elysiajs/cookie";
import { VaultService } from "./vaultService";
import {
    CreateVault,
    UpdateVault,
    GetVaultById,
    DeleteVault,
    VaultIdParams,
    TeamIdParams,
    GroupIdParams,
    TenantIdParams,
} from "../common/types/vault";

const vaultService = new VaultService();

export const vaultPlugin = new Elysia({ prefix: "/vault" })
    .use(cookie())
    .derive(async ({ cookie }) => userFromCookieMiddleware(cookie))

    // Create vault
    .post(
        "/",
        async ({ body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const vault = await vaultService.createVault({
                    ...body,
                    createdBy: user,
                });

                return status(201, {
                    message: "Vault created successfully",
                    data: vault,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            body: CreateVault,
        }
    )

    // Get vaults by group (New endpoint)
    .get(
        "/group/:groupId",
        async ({ params, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const vaults = await vaultService.getVaultsByGroup({
                    groupId: params.groupId,
                    currentUser: user,
                });

                return status(200, { data: vaults });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: GroupIdParams,
        }
    )

    // Get vault by ID (Changed to POST to accept groupId in body)
    .post(
        "/:vaultId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const vault = await vaultService.getVaultById({
                    vaultId: params.vaultId,
                    groupId: body.groupId,
                    currentUser: user,
                });

                return status(200, { data: vault });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: VaultIdParams,
            body: GetVaultById,
        }
    )

    // Update vault
    .put(
        "/:vaultId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const updatedVault = await vaultService.updateVault({
                    vaultId: params.vaultId,
                    ...body,
                    updatedBy: user,
                });

                return status(200, {
                    message: "Vault updated successfully",
                    data: updatedVault,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: VaultIdParams,
            body: UpdateVault,
        }
    )

    // Delete vault
    .delete(
        "/:vaultId",
        async ({ params, body, user, status }) => {
            try {
                if (!user) return status(401, { message: "Unauthorized" });

                const result = await vaultService.deleteVault({
                    vaultId: params.vaultId,
                    groupId: body.groupId,
                    deletedBy: user,
                });

                return status(200, {
                    message: "Vault deleted successfully",
                    data: result,
                });
            } catch (error: any) {
                return status(400, { message: error.message });
            }
        },
        {
            params: VaultIdParams,
            body: DeleteVault,
        }
    );
