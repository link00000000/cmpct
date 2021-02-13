module.exports = {
    /**
     * This list should include any files in your project that reference any of
     * your styles by name. For example, if you have a JS file in your project
     * that dynamically toggles some classes in your HTML, you should make sure
     * to include that file in this list.
     */
    purge: ['./src/**/*.tsx'],
    theme: {
        boxShadow: {
            sm: '4px 4px 0 0 rgba(19 19 19 / 15%)',
            DEFAULT: '8px 8px 0 0 rgba(19 19 19 / 15%)',
            md: '12px 12px 0 0 rgba(19 19 19 / 15%)',
            lg: '16px 16px 0 0 rgba(19 19 19 / 15%)',
            xl: '24px 24px 0 0 rgba(19 19 19 / 15%)',
            '2xl': '32px 32px 0 0 rgba(19 19 19 / 15%)',
            '3xl': '44px 44px 0 0 rgba(19 19 19 / 15%)',
            none: 'none'
        }
    }
}
