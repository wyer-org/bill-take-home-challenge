import { User } from "@prisma/client";

export function assertUserIsVerified({ user }: { user: User }) {
    if (user.isVerified) {
        return;
    }
    throw new Error("User is not verified");
}
