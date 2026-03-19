const pool = require('../config/mysql');

class MarriageCertification {
  // 创建婚姻认证
  static async create(certData) {
    const {
      user_id,
      certification_type,
      certification_images,
      signature_image
    } = certData;

    const sql = `
      INSERT INTO marriage_certifications
      (user_id, certification_type, certification_images, signature_image)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      user_id, certification_type,
      JSON.stringify(certification_images), signature_image
    ]);

    return result.insertId;
  }

  // 根据用户ID获取认证
  static async findByUserId(userId) {
    const sql = 'SELECT * FROM marriage_certifications WHERE user_id = ?';
    const [rows] = await pool.execute(sql, [userId]);
    return rows[0];
  }

  // 删除用户认证
  static async deleteByUserId(userId) {
    const sql = 'DELETE FROM marriage_certifications WHERE user_id = ?';
    const [result] = await pool.execute(sql, [userId]);
    return result.affectedRows;
  }

  // 更新认证
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (key === 'certification_images') {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const sql = `UPDATE marriage_certifications SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(sql, values);
    return result.affectedRows;
  }
}

module.exports = MarriageCertification;
