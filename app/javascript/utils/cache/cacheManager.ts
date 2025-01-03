import { Member, CheckIn } from '../../types/database';

/**
 * 缓存键前缀
 */
const CACHE_KEYS = {
  MEMBER: 'member:',
  MEMBER_CHECKINS: 'member-checkins:',
  DAILY_STATS: 'daily-stats:',
} as const;

/**
 * 内存缓存管理器
 */
class CacheManager {
  private cache: Map<string, { data: any; expires: number }>;
  private static instance: CacheManager;

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 过期时间（秒）
   */
  async set(key: string, data: any, ttl: number = 300): Promise<void> {
    const expires = Date.now() + ttl * 1000;
    this.cache.set(key, { data, expires });
  }

  /**
   * 获取缓存
   * @param key 缓存键
   */
  async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * 使用模式匹配删除缓存
   * @param pattern 模式字符串
   */
  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 缓存会员信息
   * @param member 会员信息
   */
  async cacheMember(member: Member): Promise<void> {
    await this.set(`${CACHE_KEYS.MEMBER}${member.id}`, member);
  }

  /**
   * 获取缓存的会员信息
   * @param memberId 会员ID
   */
  async getCachedMember(memberId: string): Promise<Member | null> {
    return this.get<Member>(`${CACHE_KEYS.MEMBER}${memberId}`);
  }

  /**
   * 缓存会员签到记录
   * @param memberId 会员ID
   * @param checkins 签到记录
   */
  async cacheCheckins(memberId: string, checkins: CheckIn[]): Promise<void> {
    await this.set(`${CACHE_KEYS.MEMBER_CHECKINS}${memberId}`, checkins);
  }

  /**
   * 获取缓存的签到记录
   * @param memberId 会员ID
   */
  async getCachedCheckins(memberId: string): Promise<CheckIn[] | null> {
    return this.get<CheckIn[]>(`${CACHE_KEYS.MEMBER_CHECKINS}${memberId}`);
  }

  /**
   * 清除会员相关的所有缓存
   * @param memberId 会员ID
   */
  async clearMemberCache(memberId: string): Promise<void> {
    await this.delete(`${CACHE_KEYS.MEMBER}${memberId}`);
    await this.delete(`${CACHE_KEYS.MEMBER_CHECKINS}${memberId}`);
  }
}

// 导出单例实例
export const cacheManager = CacheManager.getInstance(); 