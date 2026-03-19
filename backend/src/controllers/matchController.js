const User = require('../models/User');
const { calculateAge } = require('../utils/index');
const logger = require('../utils/logger');
const MatchHistory = require('../models/MatchHistory');
const UserFavorite = require('../models/UserFavorite');
const UserBlacklist = require('../models/UserBlacklist');

// 残疾类型关系矩阵（互补型和排斥型）
const typeRelationships = {
  '视力': { '同类型': 8, '互补型': ['肢体', '无'], '排斥型': ['听力'] },
  '听力': { '同类型': 8, '互补型': ['肢体', '无'], '排斥型': ['视力', '言语'] },
  '言语': { '同类型': 8, '互补型': ['无'], '排斥型': ['听力'] },
  '肢体': { '同类型': 8, '互补型': ['视力', '听力', '智力', '无'], '排斥型': [] },
  '智力': { '同类型': 8, '互补型': ['肢体', '无'], '排斥型': ['精神'] },
  '精神': { '同类型': 8, '互补型': ['无'], '排斥型': ['智力'] },
  '多重': { '同类型': 8, '互补型': ['无'], '排斥型': [] },
  '无': { '同类型': 8, '互补型': ['视力', '听力', '言语', '肢体', '智力', '精神', '多重'], '排斥型': [] }
};

// 计算匹配分数
const calculateMatchScore = (user1, user2) => {
  let score = 0;

  const levelWeight = parseInt(process.env.MATCH_LEVEL_WEIGHT) || 40;
  const typeWeight = parseInt(process.env.MATCH_TYPE_WEIGHT) || 35;
  const locationWeight = parseInt(process.env.MATCH_LOCATION_WEIGHT) || 15;
  const ageWeight = parseInt(process.env.MATCH_AGE_WEIGHT) || 10;

  // 1. 残疾等级匹配
  const levelDiff = Math.abs(user1.disability_level - user2.disability_level);
  if (levelDiff === 0) {
    score += 10; // 同等级
  } else if (levelDiff === 1) {
    score += 5; // 相邻等级
  } else if (levelDiff >= 3) {
    score -= 5; // 差距过大
  }

  // 2. 残疾类型交叉
  const typeRel = typeRelationships[user1.disability_type] || typeRelationships['无'];
  if (user2.disability_type === user1.disability_type) {
    score += typeRel['同类型'];
  } else if (typeRel['互补型'].includes(user2.disability_type)) {
    score += 12; // 互补型
  } else if (typeRel['排斥型'].includes(user2.disability_type)) {
    score -= 20; // 排斥型
  }

  // 3. 地理位置
  if (user1.location && user2.location) {
    if (user1.location.city === user2.location.city) {
      score += 5; // 同城
      if (user1.location.district === user2.location.district) {
        score += 5; // 同区
      }
    }
  }

  // 4. 年龄匹配
  const age2 = calculateAge(user2.birthday);
  if (user1.match_preferences) {
    const { age_min, age_max } = user1.match_preferences;
    if (age2 >= age_min && age2 <= age_max) {
      score += 5; // 在择偶范围内
    } else {
      score -= 2; // 超出范围
    }
  }

  // 计算最终分数（加权）
  const levelScore = (score >= 10 ? 10 : 0) + (score === 5 ? 5 : 0) + (score === -5 ? -5 : 0);
  const finalScore =
    (levelScore * levelWeight / 100) +
    ((score >= 12 ? 12 : (score >= 8 ? 8 : 0)) * typeWeight / 100) +
    ((score >= 10 ? 10 : (score >= 5 ? 5 : 0)) * locationWeight / 100) +
    ((score >= 5 ? 5 : (score === -2 ? -2 : 0)) * ageWeight / 100);

  return Math.max(0, Math.round(finalScore * 10)) / 10;
};

// 获取推荐用户
exports.getRecommendUsers = async (req, res, next) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(process.env.MATCH_RECOMMEND_LIMIT) || 20;

    // 筛选条件：异性、未封禁、非已婚
    const candidates = await User.find({
      user_id: { $ne: user.user_id },
      gender: user.gender === 1 ? 2 : 1,
      is_banned: false,
      marital_status: { $ne: '已婚' }
    });

    // 计算匹配分数并排序
    const scoredUsers = candidates.map(candidate => ({
      candidate,
      matchScore: calculateMatchScore(user, candidate)
    })).sort((a, b) => b.matchScore - a.matchScore);

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = scoredUsers.slice(startIndex, endIndex);

    // 格式化返回数据
    const formattedUsers = paginatedUsers.map(item => ({
      user_id: item.candidate.user_id,
      nickname: item.candidate.nickname || '未设置昵称',
      gender: item.candidate.gender,
      age: calculateAge(item.candidate.birthday),
      avatar: item.candidate.avatar,
      disability_type: item.candidate.disability_type,
      disability_level: item.candidate.disability_level,
      location: {
        city: item.candidate.location?.city || '',
        district: item.candidate.location?.district || ''
      },
      online_status: item.candidate.online_status,
      certification_status: item.candidate.certification_status,
      match_score: item.matchScore,
      match_reason: generateMatchReason(item.matchScore, user, item.candidate)
    }));

    logger.info(`用户 ${user.phone} 获取推荐，返回 ${formattedUsers.length} 条`);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total: scoredUsers.length,
          total_pages: Math.ceil(scoredUsers.length / limit)
        }
      }
    });

  } catch (error) {
    logger.error('获取推荐用户失败:', error);
    next(error);
  }
};

// 生成匹配原因
const generateMatchReason = (score, user, candidate) => {
  const reasons = [];

  if (user.disability_level === candidate.disability_level) {
    reasons.push('残疾等级相同');
  }

  const typeRel = typeRelationships[user.disability_type];
  if (typeRel && typeRel['互补型'].includes(candidate.disability_type)) {
    reasons.push('残疾类型互补');
  }

  if (user.location && candidate.location &&
      user.location.city === candidate.location.city) {
    reasons.push('同城');
  }

  const age = calculateAge(candidate.birthday);
  if (user.match_preferences &&
      age >= user.match_preferences.age_min &&
      age <= user.match_preferences.age_max) {
    reasons.push('年龄合适');
  }

  return reasons.length > 0 ? reasons.join('、') : '综合匹配';
};

/**
 * 获取匹配历史
 */
exports.getMatchHistory = async (req, res) => {
  try {
    const { user_id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const history = await MatchHistory.find({ user_id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('target_user_id', 'nickname avatar gender')
      .lean();

    const total = await MatchHistory.countDocuments({ user_id });

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('获取匹配历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取匹配历史失败'
    });
  }
};

/**
 * 收藏用户
 */
exports.favoriteUser = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { favorite_user_id, note, tags } = req.body;

    // 检查是否已经在收藏列表
    const existing = await UserFavorite.findOne({
      user_id,
      favorite_user_id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: '已经收藏过该用户'
      });
    }

    // 检查是否相互收藏
    const mutual = await UserFavorite.findOne({
      user_id: favorite_user_id,
      favorite_user_id: user_id
    });

    const favorite = await UserFavorite.create({
      user_id,
      favorite_user_id,
      note,
      tags: tags || [],
      is_mutual: !!mutual
    });

    res.json({
      success: true,
      data: favorite
    });
  } catch (error) {
    logger.error('收藏用户失败:', error);
    res.status(500).json({
      success: false,
      message: '收藏失败'
    });
  }
};

/**
 * 取消收藏
 */
exports.unfavoriteUser = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { favorite_user_id } = req.params;

    const result = await UserFavorite.findOneAndDelete({
      user_id,
      favorite_user_id
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在'
      });
    }

    res.json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    logger.error('取消收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '取消收藏失败'
    });
  }
};

/**
 * 获取收藏列表
 */
exports.getFavorites = async (req, res) => {
  try {
    const { user_id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const favorites = await UserFavorite.find({ user_id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('favorite_user_id', 'nickname avatar gender online_status')
      .lean();

    const total = await UserFavorite.countDocuments({ user_id });

    res.json({
      success: true,
      data: {
        favorites,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('获取收藏列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取收藏列表失败'
    });
  }
};

/**
 * 添加到黑名单
 */
exports.addToBlacklist = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { blocked_user_id, reason, remark } = req.body;

    // 检查是否已经在黑名单
    const existing = await UserBlacklist.findOne({
      user_id,
      blocked_user_id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: '已经在黑名单中'
      });
    }

    await UserBlacklist.create({
      user_id,
      blocked_user_id,
      reason: reason || '其他',
      remark: remark || ''
    });

    res.json({
      success: true,
      message: '添加到黑名单成功'
    });
  } catch (error) {
    logger.error('添加到黑名单失败:', error);
    res.status(500).json({
      success: false,
      message: '添加失败'
    });
  }
};

/**
 * 从黑名单移除
 */
exports.removeFromBlacklist = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { blocked_user_id } = req.params;

    const result = await UserBlacklist.findOneAndDelete({
      user_id,
      blocked_user_id
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '黑名单记录不存在'
      });
    }

    res.json({
      success: true,
      message: '从黑名单移除成功'
    });
  } catch (error) {
    logger.error('从黑名单移除失败:', error);
    res.status(500).json({
      success: false,
      message: '移除失败'
    });
  }
};

/**
 * 获取黑名单列表
 */
exports.getBlacklist = async (req, res) => {
  try {
    const { user_id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const blacklist = await UserBlacklist.find({ user_id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('blocked_user_id', 'nickname avatar gender')
      .lean();

    const total = await UserBlacklist.countDocuments({ user_id });

    res.json({
      success: true,
      data: {
        blacklist,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('获取黑名单列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取黑名单列表失败'
    });
  }
};

/**
 * 检查用户是否被屏蔽
 */
exports.isBlocked = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { blocked_user_id } = req.params;

    const blocked = await UserBlacklist.findOne({
      user_id: blocked_user_id,
      blocked_user_id: user_id
    });

    res.json({
      success: true,
      data: {
        is_blocked: !!blocked
      }
    });
  } catch (error) {
    logger.error('检查黑名单失败:', error);
    res.status(500).json({
      success: false,
      message: '检查失败'
    });
  }
};

/**
 * 获取匹配统计
 */
exports.getMatchStats = async (req, res) => {
  try {
    const { user_id } = req.user;

    // 获取统计数据
    const [historyCount, favoriteCount, blacklistCount] = await Promise.all([
      MatchHistory.countDocuments({ user_id }),
      UserFavorite.countDocuments({ user_id }),
      UserBlacklist.countDocuments({ user_id })
    ]);

    // 获取今日统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMatches = await MatchHistory.countDocuments({
      user_id,
      action: 'view',
      created_at: { $gte: today }
    });

    const todayLikes = await MatchHistory.countDocuments({
      user_id,
      action: 'like',
      created_at: { $gte: today }
    });

    res.json({
      success: true,
      data: {
        total: {
          matches: historyCount,
          favorites: favoriteCount,
          blacklist: blacklistCount
        },
        today: {
          matches: todayMatches,
          likes: todayLikes
        },
        success_rate: historyCount > 0 ? Math.round((todayLikes / historyCount) * 100) / 100 : 0
      }
    });
  } catch (error) {
    logger.error('获取匹配统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计失败'
    });
  }
};

/**
 * 记录匹配行为
 */
exports.recordMatchAction = async (user_id, target_user_id, action, score, reason) => {
  try {
    await MatchHistory.create({
      user_id,
      target_user_id,
      match_score: score,
      match_reason: reason,
      action
    });
  } catch (error) {
    logger.error('记录匹配行为失败:', error);
  }
};
