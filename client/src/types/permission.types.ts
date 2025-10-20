export type Permission = {
    id: string;
    name: string;
    description: string;
    action: Action;
    module: Module;
    updatedAt: string;
    createdAt: string;
};

export enum Module {
    VAULT = "VAULT",
    FINANCIALS = "FINANCIALS",
    REPORTING = "REPORTING",
}

export enum Action {
    CREATE = "CREATE",
    READ = "READ",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
}
