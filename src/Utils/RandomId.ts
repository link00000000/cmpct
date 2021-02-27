import nanoid from 'nanoid'

export class RandomId {
    private static idAlphabet =
        '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    private static idLength = 6

    public static generateId = nanoid.customAlphabet(
        RandomId.idAlphabet,
        RandomId.idLength
    )
}
