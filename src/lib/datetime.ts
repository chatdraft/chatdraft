
/**
 * Returns the time now in UTC in number of seconds since Jan 1 1970
 *
 * @returns {number}
 */
export const DatetimeNowUtc = () => {
    const date = new Date();
    const now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
                date.getUTCDate(), date.getUTCHours(),
                date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
    return now_utc;
}
