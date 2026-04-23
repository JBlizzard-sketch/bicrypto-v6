SELECT id FROM role WHERE name='Super Admin';
UPDATE user SET roleId = (SELECT id FROM role WHERE name='Super Admin') WHERE email='joeshady69@gmail.com';
