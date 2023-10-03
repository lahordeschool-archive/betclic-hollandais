const getKey = (i: number, j: number): string => (i < j ? `${i}-${j}` : `${j}-${i}`)

/**
 * TupleDictionary
 */
export class TupleDictionary {
  data: { [id: string]: any; keys: string[] } = { keys: [] }

  /** get */
  get(i: number, j: number): any {
    const key = getKey(i, j)
    return this.data[key]
  }

  /** set */
  set(i: number, j: number, value: any): void {
    const key = getKey(i, j)

    // Check if key already exists
    if (!this.get(i, j)) {
      this.data.keys.push(key)
    }

    this.data[key] = value
  }

  /** delete */
  delete(i: number, j: number): void {
    const key = getKey(i, j)
    const index = this.data.keys.indexOf(key)
    if (index !== -1) {
      this.data.keys.splice(index, 1)
    }
    delete this.data[key]
  }

  /** reset */
  reset(): void {
    const data = this.data
    const keys = data.keys
    while (keys.length > 0) {
      const key = keys.pop()!
      delete data[key]
    }
  }
}
