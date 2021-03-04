import spacetime from 'spacetime'
import spacetimeInformal from 'spacetime-informal'

interface Timezone {
    offsetNameLong: string
    offsetNameShort: string
    utcOffset: number
}

/**
 * Resolve timezone information from timezone database name.
 * See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 * @param timezone Timezone in database name format (ie. America/New_York)
 */
export const ResolveTimezone = (timezone: string): Timezone => {
    const utcOffset =
        spacetime.now().goto(timezone).timezone().current.offset * 60

    const {
        name: offsetNameLong,
        abbrev: offsetNameShort
    } = spacetimeInformal.display(timezone).standard

    return { offsetNameLong, offsetNameShort, utcOffset }
}
