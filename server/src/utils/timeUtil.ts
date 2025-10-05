import { addMinutes, addMonths, isBefore } from "date-fns";

export enum Time {
    FIFTEEN_MINUTES = 15,
    THREE_MONTHS = 3,
}

export function getCurrentTimePlusMinutes(minutes: number) {
    return addMinutes(new Date(), minutes);
}

export function getCurrentTimePlusMonths(months: number) {
    return addMonths(new Date(), months);
}

export function isExpired(date: Date) {
    return isBefore(date, new Date());
}
