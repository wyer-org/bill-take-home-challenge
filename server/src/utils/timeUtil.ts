import {} from "date-fns";
export const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
export const THREE_MONTHS_IN_MS = 3 * 30 * 24 * 60 * 60 * 1000;

export enum Time {
    FIFTEEN_MINUTES = FIFTEEN_MINUTES_IN_MS,
    THREE_MONTHS = THREE_MONTHS_IN_MS,
}

export function getCurrentTime() {
    return new Date();
}

export function getCurrentTimePlus(time: Time) {
    return new Date(Date.now() + time);
}
