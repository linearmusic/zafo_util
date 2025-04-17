export class ConfigModel {
    tags: string[]
    groups: string[]
    pages: string[]
    elements: string[]
    file: string
    scenario: string

    constructor(data: { tags: string[], groups: string[], pages: string[], elements: string[], scenario?: string }, file: string) {
        const { tags, groups, pages, elements, scenario } = data
        this.tags = tags
        this.groups = groups
        this.pages = pages
        this.elements = elements
        this.file = file
        this.scenario = scenario || 'scenario1'
    }

    _choose(items: string[]): string {
        return items[Math.floor(Math.random() * items.length)];
    }

    chooseTag(): string {
        return this._choose(this.tags)
    }
    chooseGroup(): string {
        return this._choose(this.groups)
    }
    choosePage(): string {
        return this._choose(this.pages)
    }
    chooseElement(): string {
        return this._choose(this.elements)
    }
}