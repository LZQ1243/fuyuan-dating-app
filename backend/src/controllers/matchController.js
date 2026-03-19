const User = require('../models/User');
const { calculateAge } = require('../utils/index');
const logger = require('../utils/logger');

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
