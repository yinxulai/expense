export class LruCache<T> {
  private keys: string[]
  private maxSize: number
  private cache: Map<string, T>

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
    this.cache = new Map<string, T>()
    this.keys = []
  }

  // 获取缓存中的数据
  get(key: string): T | undefined {
    return this.cache.get(key)
  }

  // 设置缓存数据
  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      // 如果已经存在，移除旧的键
      this.keys = this.keys.filter(k => k !== key)
    } else if (this.keys.length >= this.maxSize) {
      // 超过最大缓存大小，移除最旧的键
      const oldestKey = this.keys.shift()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    // 添加新数据
    this.cache.set(key, value)
    this.keys.push(key)
  }

  // 清空缓存
  clear(): void {
    this.keys = []
    this.cache.clear()
  }
}
