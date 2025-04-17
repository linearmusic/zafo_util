export class Serializable {

    serialize(): string {
        return JSON.stringify(this)
    }

}