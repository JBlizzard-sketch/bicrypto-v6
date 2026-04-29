/**
 * Schema Fix for MySQL 5.7+ Compatibility
 * Removes DEFAULT constraints from TEXT/BLOB/JSON columns
 * This will be executed automatically by the backend during initialization
 */

import { Sequelize } from 'sequelize-typescript';

export async function fixMySQL57SchemaDefaults(sequelize: Sequelize): Promise<void> {
  try {
    console.log('[SCHEMA FIX] Starting MySQL 5.7+ compatibility fixes...');

    const fixes = [
      {
        table: 'api_key',
        column: 'permissions',
        sql: `ALTER TABLE \`api_key\` MODIFY \`permissions\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL`
      },
      {
        table: 'extension',
        column: 'permissions',
        sql: `ALTER TABLE \`extension\` MODIFY \`permissions\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL`
      },
      {
        table: 'page',
        column: 'content',
        sql: `ALTER TABLE \`page\` MODIFY \`content\` longtext`
      },
      {
        table: 'post',
        column: 'content',
        sql: `ALTER TABLE \`post\` MODIFY \`content\` longtext`
      },
      {
        table: 'role',
        column: 'permissions',
        sql: `ALTER TABLE \`role\` MODIFY \`permissions\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL`
      }
    ];

    for (const fix of fixes) {
      try {
        await sequelize.query(fix.sql);
        console.log(`✅ [SCHEMA FIX] Fixed ${fix.table}.${fix.column}`);
      } catch (err: any) {
        if (err.message.includes('COLUMN_NAME does not exist') || err.message.includes('no such table')) {
          console.log(`⏭️  [SCHEMA FIX] Skipped ${fix.table}.${fix.column} (table not yet created)`);
        } else if (err.message.includes('Duplicate key name') || err.message.includes('Syntax error')) {
          console.log(`⏭️  [SCHEMA FIX] Skipped ${fix.table}.${fix.column} (already fixed)`);
        } else {
          console.warn(`⚠️  [SCHEMA FIX] Error fixing ${fix.table}.${fix.column}:`, err.message.substring(0, 100));
        }
      }
    }

    console.log('[SCHEMA FIX] Completed');
  } catch (err: any) {
    console.error('[SCHEMA FIX] Fatal error:', err.message);
  }
}
