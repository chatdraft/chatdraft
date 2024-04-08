export const DatetimeNowUtc = () => {
    const localToUtc_ms = new Date().getTimezoneOffset() * 60 * 1000;
    return Date.now() - localToUtc_ms;
}
