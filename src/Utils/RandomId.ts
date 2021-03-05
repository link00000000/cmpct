import { customAlphabet } from 'nanoid'

const CHARACTER_SET =
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const LENGTH = 6

/**
 * Generate a random ID from the custom character set
 */
export const RandomId = customAlphabet(CHARACTER_SET, LENGTH)
