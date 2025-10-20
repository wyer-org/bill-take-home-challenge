import { Action, Module, User } from "@prisma/client";
import z from "zod";

export const CreatePermision = z.object({
    module: z.enum(Module, { error: "Module is needed" }),
    action: z.enum(Action, { error: "Action is needed" }),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "description is required"),
});

export type CreatePermissionDto = {
    module: Module;
    action: Action;
    name: string;
    description: string;
    createdBy: User;
};

export type SeedAdminPermissionsDto = {
    createdBy: User;
};

export const UpdatePermission = z.object({
    permissionId: z.uuid().min(1, "Permission Id is required"),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "description is required"),
});

export type UpdatePermissionDto = {
    permissionId: string;
    name: string;
    description: string;
    updatedBy: User;
};
