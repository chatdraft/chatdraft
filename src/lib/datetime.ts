export const DatetimeNowUtc = () => {
    const localToUtc = new Date().getTimezoneOffset() * 60;
    return Date.now() + localToUtc;
}
