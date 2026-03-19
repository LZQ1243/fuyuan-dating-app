const pool = require('../config/mysql');

class User {
  // 创建用户
  static async create(userData) {
    const {
      username,
      phone,
      password,
      real_name,
      id_card,
      is_disabled,
      province,
      city,
      district,
      disability_type,
      disability_level,
      disability_video,
      marital_status
    } = userData;

    const sql = `
      INSERT INTO users
      (username, phone, password, real_name, id_card, ip_location,
       province, city, district, is_disabled, disability_type,
       disability_level, disability_video, marital_status, registration_step, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `;

    const [result] = await pool.execute(sql, [
      username, phone, password, real_name, id_card, '',
      province, city, district, is_disabled ? 1 : 0,
      disability_type, disability_level, disability_video, marital_status
    ]);

    return result.insertId;
  }

  // 根据ID查找用户
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows[0];
  }

  // 根据手机号查找用户
  static async findByPhone(phone) {
    const sql = 'SELECT * FROM users WHERE phone = ?';
    const [rows] = await pool.execute(sql, [phone]);
    return rows[0];
  }

  // 更新用户
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(sql, values);
    return result.affectedRows;
  }

  // 更新注册步骤
  static async updateRegistrationStep(id, step) {
    const sql = 'UPDATE users SET registration_step = ? WHERE id = ?';
    const [result] = await pool.execute(sql, [step, id]);
    return result.affectedRows;
  }

  // 更新用户状态
  static async updateStatus(id, status) {
    const sql = 'UPDATE users SET status = ? WHERE id = ?';
    const [result] = await pool.execute(sql, [status, id]);
    return result.affectedRows;
  }

  // 删除用户
  static async deleteById(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows;
  }

  // 获取用户列表
  static async findAll(options = {}) {
    const { page = 1, limit = 20, keyword, status, is_disabled } = options;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (keyword) {
      sql += ' AND (username LIKE ? OR phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (is_disabled !== undefined) {
      sql += ' AND is_disabled = ?';
      params.push(is_disabled ? 1 : 0);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  // 统计用户数量
  static async count(options = {}) {
    const { keyword, status, is_disabled } = options;

    let sql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const params = [];

    if (keyword) {
      sql += ' AND (username LIKE ? OR phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (is_disabled !== undefined) {
      sql += ' AND is_disabled = ?';
      params.push(is_disabled ? 1 : 0);
    }

    const [rows] = await pool.execute(sql, params);
    return rows[0].total;
  }
}

module.exports = User;
