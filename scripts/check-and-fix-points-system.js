/**
 * 积分系统检查和修复脚本
 *
 * 检查并修复以下问题：
 * 1. 用户没有 user_points 记录
 * 2. invitation_configs 表没有初始化
 * 3. 用户没有 admin_config 记录
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAndFixPointsSystem() {
  console.log('=== 开始检查积分系统 ===\n');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    // 检查 1: user_points 表是否存在
    console.log('检查 1: user_points 表');
    const [tables] = await connection.query("SHOW TABLES LIKE 'user_points'");
    if (tables.length === 0) {
      console.log('❌ user_points 表不存在');
    } else {
      console.log('✅ user_points 表存在');
    }
    console.log();

    // 检查 2: invitation_configs 表是否存在
    console.log('检查 2: invitation_configs 表');
    const [tables2] = await connection.query(
      "SHOW TABLES LIKE 'invitation_configs'",
    );
    if (tables2.length === 0) {
      console.log('❌ invitation_configs 表不存在');
    } else {
      console.log('✅ invitation_configs 表存在');
    }
    console.log();

    // 检查 3: invitation_configs 表是否有记录
    console.log('检查 3: invitation_configs 表记录');
    const [configs] = await connection.query(
      'SELECT * FROM invitation_configs',
    );
    if (configs.length === 0) {
      console.log('❌ invitation_configs 表为空，正在插入默认配置...');
      await connection.execute(
        'INSERT INTO invitation_configs (id, enabled, reward_points, redeem_threshold, card_key_type) VALUES (?, ?, ?, ?, ?)',
        [1, true, 100, 300, 'week'],
      );
      console.log('✅ 已插入默认配置');
    } else {
      console.log('✅ invitation_configs 表有记录');
      console.log('   配置:', JSON.stringify(configs[0], null, 2));
    }
    console.log();

    // 检查 4: users 表中的用户是否有 user_points 记录
    console.log('检查 4: 检查用户积分记录');
    const [users] = await connection.query('SELECT username FROM users');
    console.log(`   用户总数: ${users.length}`);

    let missingPointsCount = 0;
    for (const user of users) {
      const [points] = await connection.query(
        'SELECT * FROM user_points WHERE username = ?',
        [user.username],
      );
      if (points.length === 0) {
        console.log(`   ❌ 用户 ${user.username} 没有积分记录`);
        missingPointsCount++;
      }
    }

    if (missingPointsCount === 0) {
      console.log('✅ 所有用户都有积分记录');
    } else {
      console.log(
        `   ⚠️  ${missingPointsCount} 个用户缺少积分记录，正在修复...`,
      );

      for (const user of users) {
        const [points] = await connection.query(
          'SELECT * FROM user_points WHERE username = ?',
          [user.username],
        );
        if (points.length === 0) {
          const invitationCode = `${user.username}_${Date.now().toString(36)}`;
          await connection.execute(
            'INSERT INTO user_points (username, invitation_code) VALUES (?, ?)',
            [user.username, invitationCode],
          );
          console.log(
            `   ✅ 已为用户 ${user.username} 创建积分记录，邀请码: ${invitationCode}`,
          );
        }
      }
    }
    console.log();

    // 检查 5: admin_config 表是否存在用户
    console.log('检查 5: 检查 admin_config 中的用户');
    const [adminConfigs] = await connection.query(
      'SELECT config FROM admin_config',
    );
    if (adminConfigs.length === 0) {
      console.log('❌ admin_config 表为空');
    } else {
      const config = JSON.parse(adminConfigs[0].config);
      console.log(
        `   admin_config 中用户数: ${config.UserConfig.Users.length}`,
      );

      for (const user of users) {
        const userInConfig = config.UserConfig.Users.find(
          (u) => u.username === user.username,
        );
        if (!userInConfig) {
          console.log(`   ❌ 用户 ${user.username} 不在 admin_config 中`);
        }
      }
    }
    console.log();

    console.log('=== 检查完成 ===');
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await connection.end();
  }
}

checkAndFixPointsSystem();
