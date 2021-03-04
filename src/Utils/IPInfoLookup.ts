import { ResolveTimezone } from './ResolveTimezone'
import axios from 'axios'

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

export const IPInfoLookup = async (ipAddress: string) => {
    const API_TOKEN = process.env.IPINFO_API_TOKEN

    if (!API_TOKEN) {
        throw new Error(
            'API access must be set with IPINFO_API_TOKEN environment variable. Get one at https://ipinfo.io'
        )
    }

    const { data: response } = await axios.get<IPInfoResponse>(
        `${API_HOST}/${ipAddress}?token=${API_TOKEN}`
    )

    if (response.bogon) {
        throw new TypeError('Bogon IP address')
    }

    const coordinateStrings = response.loc ? response.loc.split(',') : undefined
    const coordinates =
        coordinateStrings && coordinateStrings.length == 2
            ? {
                  longitude: parseFloat(coordinateStrings[0]),
                  latitude: parseFloat(coordinateStrings[1])
              }
            : undefined

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
