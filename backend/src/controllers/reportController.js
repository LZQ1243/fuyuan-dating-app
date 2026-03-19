const ReportService = require('../services/reportService');

/**
 * 报告控制器 - 处理内容举报和用户举报
 */

/**
 * 创建举报
 */
exports.createReport = async (req, res) => {
  try {
    const { content_type, content_id, reason, description } = req.body;
    const reporter_id = req.user.id;

    // 验证必填字段
    if (!content_type || !content_id || !reason) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的举报信息'
      });
    }

    const report = await ReportService.createReport({
      reporter_id,
      content_type,
      content_id,
      reason,
      description
    });

    res.status(201).json({
      success: true,
      message: '举报已提交，感谢您的反馈',
      data: report
    });
  } catch (error) {
    console.error('创建举报失败:', error);
    res.status(500).json({
      success: false,
      message: '提交失败，请稍后重试'
    });
  }
};

/**
 * 获取举报列表（管理员）
 */
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, content_type } = req.query;

    const result = await ReportService.getReports({
      page,
      limit,
      status,
      content_type
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取举报列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

/**
 * 处理举报（管理员）
 */
exports.processReport = async (req, res) => {
  try {
    const { report_id, action, reason } = req.body;
    const reviewer_id = req.user.id;

    // 验证必填字段
    if (!report_id || !action) {
      return res.status(400).json({
        success: false,
        message: '请选择处理方式'
      });
    }

    // 验证操作
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: '无效的操作'
      });
    }

    const result = await ReportService.processReport(report_id, action, reason);

    res.json({
      success: true,
      message: action === 'approve' ? '举报已处理' : '举报已驳回',
      data: result
    });
  } catch (error) {
    console.error('处理举报失败:', error);
    res.status(500).json({
      success: false,
      message: '处理失败，请稍后重试'
    });
  }
};

/**
 * 获取举报详情
 */
exports.getReportDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // 这里需要实际的Report模型查询
    const report = {
      id,
      reporter_id: req.user.id,
      status: 'pending',
      created_at: new Date()
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('获取举报详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};
