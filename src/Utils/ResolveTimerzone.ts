/**
 * Resolve timezone information from timezone database name.
 * See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 * @param timezone Timezone in database name format (ie. America/New_York)
 */

interface Timezone {
    offsetNameLong: string
    offsetNameShort: string
    utcOffset: number
}

export const ResolveTimezone = (timezone: string): Timezone => {
    return { offsetNameLong: '@STUB', offsetNameShort: '@STUB', utcOffset: 0 }
}
