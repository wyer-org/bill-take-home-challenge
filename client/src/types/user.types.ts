export type RegisterUserDto = {
    email: string;
    name: string;
};

export type InitLoginUserDto = {
    email: string;
};

export type User = {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    userType: UserType;
    createdAt: Date;
    updatedAt: Date;
};

export enum UserType {
    ADMIN = "ADMIN",
    USER = "USER",
}
