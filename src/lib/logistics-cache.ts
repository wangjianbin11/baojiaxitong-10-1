// 缓存管理器，用于优化API调用性能

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // 生存时间（毫秒）
}

class LogisticsCache {
  private cache = new Map<string, CacheItem<unknown>>()

  // 设置缓存
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  // 清除缓存
  clear(): void {
    this.cache.clear()
  }

  // 删除特定缓存
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
}

// 创建单例实例
export const logisticsCache = new LogisticsCache()

// 缓存键生成器
export const CacheKeys = {
  allRecords: () => 'airtable:all_records',
  companies: () => 'logistics:companies',
  channels: (company: string) => `logistics:channels:${company}`,
  countries: (company: string, channel: string) => `logistics:countries:${company}:${channel}`,
}