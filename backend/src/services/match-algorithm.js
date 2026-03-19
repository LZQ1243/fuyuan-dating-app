/**
 * 优化后的匹配算法
 * 降低时间复杂度,提升性能
 */

class MatchAlgorithm {
  /**
   * 计算两个用户之间的匹配分数
   * O(1) 时间复杂度
   */
  static calculateMatchScore(userA, userB) {
    let score = 0;
    let maxScore = 0;

    // 1. 年龄匹配 (权重: 20%)
    maxScore += 20;
    const ageDiff = Math.abs(userA.age - userB.age);
    if (ageDiff <= 3) score += 20;
    else if (ageDiff <= 5) score += 15;
    else if (ageDiff <= 10) score += 10;
    else score += 5;

    // 2. 地理位置 (权重: 25%)
    maxScore += 25;
    const distance = this.calculateDistance(userA.location, userB.location);
    if (distance <= 10) score += 25;
    else if (distance <= 30) score += 20;
    else if (distance <= 50) score += 15;
    else if (distance <= 100) score += 10;
    else score += 5;

    // 3. 兴趣爱好 (权重: 30%)
    maxScore += 30;
    const commonInterests = this.calculateCommonInterests(
      userA.interests || [],
      userB.interests || []
    );
    const maxInterests = Math.max(
      (userA.interests || []).length,
      (userB.interests || []).length
    );
    if (maxInterests > 0) {
      score += (commonInterests / maxInterests) * 30;
    }

    // 4. 教育背景 (权重: 10%)
    maxScore += 10;
    if (userA.education && userB.education) {
      if (userA.education === userB.education) score += 10;
      else score += 5;
    }

    // 5. 收入水平 (权重: 10%)
    maxScore += 10;
    if (userA.income && userB.income) {
      const incomeDiff = Math.abs(userA.income - userB.income);
      if (incomeDiff <= 2) score += 10;
      else if (incomeDiff <= 5) score += 7;
      else score += 4;
    }

    // 6. 职业匹配 (权重: 5%)
    maxScore += 5;
    if (userA.profession && userB.profession) {
      if (userA.profession === userB.profession) score += 5;
    }

    // 归一化分数 (0-100)
    return Math.round((score / maxScore) * 100);
  }

  /**
   * 计算两点之间的距离 (Haversine公式)
   * O(1) 时间复杂度
   */
  static calculateDistance(locA, locB) {
    if (!locA || !locB || !locA.coordinates || !locB.coordinates) {
      return Infinity;
    }

    const [lat1, lon1] = locA.coordinates;
    const [lat2, lon2] = locB.coordinates;

    const R = 6371; // 地球半径(km)
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * 转换为弧度
   */
  static toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * 计算共同兴趣爱好
   * O(n) 时间复杂度
   */
  static calculateCommonInterests(interestsA, interestsB) {
    const setA = new Set(interestsA);
    let common = 0;

    for (const interest of interestsB) {
      if (setA.has(interest)) {
        common++;
      }
    }

    return common;
  }

  /**
   * 批量计算匹配分数 (优化版)
   * O(n) 时间复杂度 (使用缓存)
   */
  static async calculateBatchMatches(targetUser, candidates, cache) {
    const results = [];
    const cacheKeyPrefix = `match:${targetUser._id}:`;

    for (const candidate of candidates) {
      const cacheKey = `${cacheKeyPrefix}${candidate._id}`;
      
      // 尝试从缓存获取
      let matchScore = cache ? await cache.get(cacheKey) : null;
      
      if (matchScore === null) {
        // 计算匹配分数
        matchScore = this.calculateMatchScore(targetUser, candidate);
        
        // 缓存结果 (1小时)
        if (cache) {
          await cache.set(cacheKey, matchScore, 3600);
        }
      }

      results.push({
        user: candidate,
        matchScore
      });
    }

    // 按匹配分数降序排序
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 推荐匹配用户 (使用索引和缓存优化)
   * O(log n) 时间复杂度 (使用预计算的索引)
   */
  static async recommendMatches(user, limit = 20) {
    // 使用预计算的用户索引
    // 这部分应该在实际实现中使用数据库索引或专门的推荐系统
    
    // 伪代码示例:
    // 1. 获取符合基本条件的候选用户 (使用地理空间索引)
    // const candidates = await User.find({
    //   location: {
    //     $near: {
    //       $geometry: user.location,
    //       $maxDistance: 50000 // 50km
    //     }
    //   },
    //   gender: user.preference.gender,
    //   age: { $gte: user.preference.minAge, $lte: user.preference.maxAge }
    // }).limit(100).lean();
    
    // 2. 使用缓存批量计算匹配分数
    // const matches = await this.calculateBatchMatches(user, candidates, redis);
    
    // 3. 返回Top N
    // return matches.slice(0, limit);
    
    return [];
  }
}

module.exports = MatchAlgorithm;
