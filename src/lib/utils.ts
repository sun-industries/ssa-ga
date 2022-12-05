import type { Time } from './orbitalTypes';

export function cppTimeToJsDate(time:Time):Date {
    const date = new Date(0);
    date.setUTCFullYear(time.year);
    date.setUTCMonth(time.mon - 1);
    date.setUTCDate(time.day);
    date.setUTCHours(time.hr);
    date.setUTCMinutes(time.mi);
    date.setUTCSeconds(time.sec);
    const intUTCSeconds = Math.floor(time.sec);
    date.setUTCSeconds(intUTCSeconds);
    date.setUTCMilliseconds(Math.floor( (time.sec - intUTCSeconds) * 1000 ) );
    return date;
}