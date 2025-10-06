import { Cookie } from "elysia/cookies";
import { prisma } from "../db/client";
import { isExpired } from "../utils/timeUtil";

export async function userFromCookieMiddleware(
    cookie: Record<string, Cookie<unknown>> & Record<string, string>
) {
    const sid = cookie.session.value as string;

    if (!sid) return { user: null };

    const session = await prisma.userSession.findUnique({
        where: { id: sid },
        include: {
            user: true,
        },
    });

    if (!session || !session.user) return { user: null };

    if (isExpired(session.expiresAt)) {
        await prisma.userSession.delete({ where: { id: sid } });
        return { user: null };
    }

    return { user: session.user };
}
