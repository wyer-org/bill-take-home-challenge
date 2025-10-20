export type RegisterUserDto = {
    email: string;
    name: string;
};

export type InitLoginUserDto = {
    email: string;
};

export enum UserType {
    ADMIN = "ADMIN",
    USER = "USER",
}

export interface Tenant {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface Team {
    id: string;
    name: string;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Group {
    id: string;
    name: string;
    teamId: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserGroup {
    id: string;
    userId: string;
    groupId: string;
    group: Group;
}

export interface User {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    userType: UserType;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
    teamId: string;
    tenant: Tenant;
    team: Team;
    userGroups: UserGroup[];
}
