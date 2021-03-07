import { logger } from './../Logger'
import { ResolveTimezone } from './ResolveTimezone'
import axios from 'axios'

/**
 * Response from ipinfo.io
 */
interface IPInfoResponse {
    ip: string
    hostname: string
    city: string
    region: string
    country: string
    loc: string
    org: string
    postal: string
    timezone: string
    bogon: boolean
}

const API_HOST = 'https://ipinfo.io'

/**
 * Fetch information about an IP address from https://ipinfo.io
 * @param ipAddress IP address to lookup
 */
export const IPInfoLookup = async (ipAddress: string) => {
    const API_TOKEN = process.env.IPINFO_API_TOKEN

    if (!API_TOKEN) {
        throw new Error(
            'API access must be set with IPINFO_API_TOKEN environment variable. Get one at https://ipinfo.io'
        )
    }

    const URL = `${API_HOST}/${ipAddress}?token=${API_TOKEN}`
    logger.info(`Fetching IP info for ${ipAddress} at ${URL}`)

    const { data: response } = await axios.get<IPInfoResponse>(URL)

    // A bogon IP address is one that is likely bogus. This might trigger if you
    // lookup using a local IP address like 127.0.0.1 or ::1
    if (response.bogon) {
        throw new TypeError('Bogon IP address: ' + ipAddress)
    }

    // Parse longitude and latitude coordinates
    const coordinateStrings = response.loc ? response.loc.split(',') : undefined
    const coordinates =
        coordinateStrings && coordinateStrings.length == 2
            ? {
                  longitude: parseFloat(coordinateStrings[0]),
                  latitude: parseFloat(coordinateStrings[1])
              }
            : undefined

    // Parse internet service provider's name
    const provider = response.org?.match(/^[^ ]* (.*)$/)

    return {
        city: response.city,
        state: response.region,
        country: response.country,
        coordinates,
        provider: provider && provider[1] ? provider[1] : undefined,
        timezone: ResolveTimezone(response.timezone)
    }
}
