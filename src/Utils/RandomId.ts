import { customAlphabet } from 'nanoid'

const CHARACTER_SET =
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const LENGTH = 6

export const RandomId = customAlphabet(CHARACTER_SET, LENGTH)
