import { Action, Module, User } from "@prisma/client";
import { z } from "zod";

export const CreatePermission = z.object({
    module: z.enum(Module),
    action: z.enum(Action),
    name: z.string().min(1, "Permission name is required"),
    description: z.string().optional(),
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
