module.exports = {
    /**
     * This list should include any files in your project that reference any of
     * your styles by name. For example, if you have a JS file in your project
     * that dynamically toggles some classes in your HTML, you should make sure
     * to include that file in this list.
     */
    purge: ['./src/**/*.tsx'],
    theme: {
        zIndex: {
            999998: 999998,
            999999: 999999
        },
        boxShadow: {
            none: 'none',
            sm: '4px 4px 0 0 rgba(19 19 19 / 15%)',
            DEFAULT: '8px 8px 0 0 rgba(19 19 19 / 15%)',
            md: '12px 12px 0 0 rgba(19 19 19 / 15%)',
            lg: '16px 16px 0 0 rgba(19 19 19 / 15%)',
            xl: '24px 24px 0 0 rgba(19 19 19 / 15%)',
            '2xl': '32px 32px 0 0 rgba(19 19 19 / 15%)',
            '3xl': '44px 44px 0 0 rgba(19 19 19 / 15%)',
            hidden: '0 0 0 0 rgba(19 19 19 / 15%)',
            'sm-dark': '4px 4px 0 0 #000',
            dark: '8px 8px 0 0 #000',
            'md-dark': '12px 12px 0 0 #000',
            'lg-dark': '16px 16px 0 0 #000',
            'xl-dark': '24px 24px 0 0 #000',
            '2xl-dark': '32px 32px 0 0 #000',
            '3xl-dark': '44px 44px 0 0 #000',
            'hidden-dark': '0 0 0 0 #000'
        },
        extend: {
            transitionTimingFunction: {
                expo: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            },
            spacing: {
                '8px': '8px'
            }
        }
    },
    variants: {
        translate: ['active', 'group-hover']
    }
}
