const platforms: { [key: string]: string[] } = {
    'Microsoft Windows': ['win32', 'win64', 'windows', 'wince'],
    'Apple macOS': [
        'macintosh',
        'macintel',
        'macppc',
        'mac68k',
        'darwin',
        'macos'
    ],
    Linux: ['linux'],
    'Apple iOS': ['iPhone', 'iPad', 'iPod'],
    Android: ['Android']
}

export const ResolveOS = (
    navigatorUserAgent: string,
    navigatorPlatform: string
) => {
    for (const [platform, matchers] of Object.entries(platforms)) {
        for (const matcher in matchers) {
            const expression = new RegExp(matcher, 'i')

            if (
                navigatorPlatform.match(expression) ||
                navigatorUserAgent.match(expression)
            ) {
                return platform
            }
        }
    }

    return undefined
}
