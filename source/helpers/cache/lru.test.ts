import { LruCache } from './lru' // 假设你的缓存实现文件名为 cache.ts

describe('LruCache', () => {
  let cache: LruCache<number>

  beforeEach(() => {
    cache = new LruCache<number>(3) // 设置最大缓存大小为 3
  })

  test('should store and retrieve a value', () => {
    cache.set('item1', 1)
    expect(cache.get('item1')).toBe(1)
  })

  test('should return undefined for nonexistent key', () => {
    expect(cache.get('item2')).toBeUndefined()
  })

  test('should evict the least recently used item', () => {
    cache.set('item1', 1)
    cache.set('item2', 2)
    cache.set('item3', 3)
    cache.set('item4', 4) // 这将导致 'item1' 被移除

    expect(cache.get('item1')).toBeUndefined()
    expect(cache.get('item2')).toBe(2)
    expect(cache.get('item3')).toBe(3)
    expect(cache.get('item4')).toBe(4)
  })

  test('should update existing value and not evict it', () => {
    cache.set('item1', 1)
    cache.set('item2', 2)
    cache.set('item1', 10) // 更新 'item1'

    expect(cache.get('item1')).toBe(10)
    expect(cache.get('item2')).toBe(2)

    cache.set('item3', 3)
    cache.set('item4', 4) // 这将导致 'item2' 被移除

    expect(cache.get('item2')).toBeUndefined()
    expect(cache.get('item1')).toBe(10)
    expect(cache.get('item3')).toBe(3)
    expect(cache.get('item4')).toBe(4)
  })

  test('should clear cache', () => {
    cache.set('item1', 1)
    cache.set('item2', 2)
    cache.clear()

    expect(cache.get('item1')).toBeUndefined()
    expect(cache.get('item2')).toBeUndefined()
  })
})
