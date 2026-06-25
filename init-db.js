const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend/data/v6.db');
const SCHEMA_PATH = path.join(__dirname, 'backend/src/db/schema.sql');

// 初始化資料庫
function initDatabase() {
  // 確保目錄存在
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new sqlite3.Database(DB_PATH);

  // 讀取 schema.sql
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

  // 執行 schema（建立表格）
  db.exec(schema, (err) => {
    if (err) {
      console.error('❌ Schema 執行失敗:', err.message);
      db.close();
      return;
    }
    console.log('✅ 資料表建立完成');

    // 檢查是否已有管理員帳號
    db.get('SELECT * FROM users WHERE role = "admin" LIMIT 1', async (err, row) => {
      if (err) {
        console.error('❌ 查詢使用者失敗:', err.message);
        db.close();
        return;
      }

      if (row) {
        console.log('✅ 管理員帳號已存在，跳過初始化');
        db.close();
        return;
      }

      // 建立預設管理員（帳號：遙控器 / 密碼：admin123）
      const username = '遙控器';
      const plainPassword = 'admin123';
      const hashedPassword = bcrypt.hashSync(plainPassword, 10);

      const stmt = db.prepare(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
      );
      stmt.run(username, hashedPassword, 'admin', function(err) {
        if (err) {
          console.error('❌ 建立管理員失敗:', err.message);
        } else {
          console.log(`✅ 管理員帳號建立成功！`);
          console.log(`   👤 帳號: ${username}`);
          console.log(`   🔑 密碼: ${plainPassword} （請盡速修改）`);
        }
        stmt.finalize();
        db.close();
      });
    });
  });
}

// 執行初始化
initDatabase();
