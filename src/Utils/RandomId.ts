import nanoid from 'nanoid'

const CHARACTER_SET =
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const LENGTH = 6

export const RandomId = nanoid.customAlphabet(CHARACTER_SET, LENGTH)
