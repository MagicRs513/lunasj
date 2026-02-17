-- 积分系统检查和修复 SQL

-- 检查 user_points 表数据
SELECT 
    '=== user_points 表数据 ===' AS info;

SELECT 
    username,
    invitation_code,
    balance,
    total_earned,
    total_redeemed,
    created_at,
    updated_at
FROM user_points;

-- 检查 invitation_configs 表数据
SELECT 
    '=== invitation_configs 表数据 ===' AS info;

SELECT 
    id,
    enabled,
    reward_points,
    redeem_threshold,
    card_key_type,
    created_at,
    updated_at
FROM invitation_configs;

-- 检查哪些用户缺少 user_points 记录
SELECT 
    '=== 缺少 user_points 记录的用户 ===' AS info;

SELECT 
    u.username,
    u.role,
    u.created_at
FROM users u
LEFT JOIN user_points p ON u.username = p.username
WHERE p.username IS NULL;

-- 修复：为缺少积分记录的用户创建记录（生成随机邀请码）
-- 取消下面的注释来执行修复
-- INSERT INTO user_points (username, invitation_code)
-- SELECT 
--     username,
--     CONCAT(username, '_', FLOOR(RAND() * 1000000000)) as invitation_code
-- FROM users u
-- LEFT JOIN user_points p ON u.username = p.username
-- WHERE p.username IS NULL;
