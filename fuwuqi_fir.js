// 引入必要模块
const express = require('express');
const bodyParser = require('body-parser');
const mariadb = require('mariadb');
const cors = require('cors');


// 创建 Express 应用实例
const app = express();
app.use(cors());  // 允许所有的跨域请求
// 设置服务器监听的端口号
const port = 3000;

// 使用 body-parser 中间件来解析请求体中的 JSON 数据
app.use(bodyParser.json());

// 创建数据库连接池
const db = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'woainignn1',
    database: 'student_db',
    connectionLimit: 10, // 增大连接池容量
    idleTimeout: 30000,  // 30秒空闲超时
    resetAfterUse: true   // 每次使用后重置连接
  });

// 连接到数据库并启动服务
async function connectDatabase() {
    try {
        const connection = await db.getConnection();
        console.log('已连接到数据库');
        connection.release(); // 释放连接
    } catch (err) {
        console.error('无法连接到数据库:', err);
    }
}

connectDatabase();

// 查询所有学生数据，并按成绩排序
app.get('/students', async (req, res) => {
    try {
        const connection = await db.getConnection();
        const query = 'SELECT * FROM students ORDER BY avg DESC';  
        const results = await connection.query(query);
        connection.release();  // 释放连接
        res.json(results);
    } catch (err) {
        console.error('查询错误:', err);
        return res.status(500).json({ message: '数据库查询失败' });
    }
});
// 添加学生接口
app.post('/students', async (req, res) => {
    try {
        const { id, name, score1, score2, score3 } = req.body;

        // 基础参数验证
        if (!id || !name || !score1 || !score2 || !score3) {
            return res.status(400).json({ message: '所有字段都是必填的' });
        }

        // 计算平均分
        const avg = Math.round((score1 + score2 + score3) / 3);

        // 插入数据库
        const result = await db.query(
            'INSERT INTO students (id, name, score1, score2, score3, avg) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, score1, score2, score3, avg]
        );

        res.status(201).json({
            success: true,
            message: '添加学生成功'
        });

    } catch (error) {
        // 处理学号重复的情况
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: '学号已存在' });
        }
        res.status(500).json({ message: '添加学生失败' });
    }
});

// 更新指定学生的成绩
app.put('/students/:id', async (req, res) => {
    const studentId = req.params.id;
    const { score1, score2, score3 } = req.body;
    const avg = (score1 + score2 + score3) / 3;  // 重新计算平均成绩

    const query = 'UPDATE students SET score1 = ?, score2 = ?, score3 = ?, avg = ? WHERE id = ?';
    
    try {
        const connection = await db.getConnection();
        const result = await connection.query(query, [score1, score2, score3, avg, studentId]);
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '学生未找到' });
        }
        res.json({ message: '学生信息已更新' });
    } catch (err) {
        console.error('无法更新学生数据:', err);
        return res.status(500).json({ message: '无法更新学生数据' });
    }
});

// 删除指定学生的数据
app.delete('/students/:id', async (req, res) => {
    const studentId = req.params.id;
    const query = 'DELETE FROM students WHERE id = ?';
    
    try {
        const connection = await db.getConnection();
        const result = await connection.query(query, [studentId]);
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '学生未找到' });
        }
        res.json({ message: '学生信息已删除' });
    } catch (err) {
        console.error('无法删除学生数据:', err);
        return res.status(500).json({ message: '无法删除学生数据' });
    }
});

// // 根据 id 查询学生信息
// app.get('/students/id/:id', (req, res) => {
//     const studentId = String(req.params.id);
//     console.log('进入 id 查询路由');
    
//     const query = 'SELECT * FROM students WHERE id = ?';
//     db.query(query, [studentId], (err, results) => {
//         if (err) {
//             console.error('查询错误:', err);
//             return res.status(500).json({ message: '数据库查询失败' });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ message: '没有找到该学生' });
//         }
//         res.json(results[0]);
//     });
// });
// 根据 ID 查询学生（优化后）
app.get('/students/id/:id', async (req, res) => {
    try {
      const connection = await db.getConnection();
      const studentId = String(req.params.id);
      const query = 'SELECT * FROM students WHERE id = ?';
      const results = await connection.query(query, [studentId]);
      connection.release();
  
      if (results.length === 0) {
        return res.status(404).json({ message: '学生未找到' });
      }
      res.json(results[0]);
    } catch (err) {
      console.error('查询错误:', err);
      res.status(500).json({ message: '数据库查询失败' });
    }
  });
  
// // 根据姓名模糊查询学生信息
// app.get('/students/name/:name', (req, res) => {
//     console.log('进入姓名模糊查询路由');
//     const name = req.params.name;
//     const query = 'SELECT * FROM students WHERE name LIKE ?';
//     db.query(query, [`%${name}%`], (err, results) => {
//         if (err) {
//             console.error('查询错误:', err);
//             return res.status(500).json({ message: '数据库查询失败' });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ message: '没有找到符合条件的学生' });
//         }
//         res.json(results);
//     });
// });

  // 根据姓名模糊查询（优化后）
  app.get('/students/name/:name', async (req, res) => {
    try {
      const connection = await db.getConnection();
      const name = req.params.name;
      const query = 'SELECT * FROM students WHERE name LIKE ?';
      const results = await connection.query(query, [`%${name}%`]);
      connection.release();
  
      if (results.length === 0) {
        return res.status(404).json({ message: '未找到符合条件的学生' });
      }
      res.json(results);
    } catch (err) {
      console.error('查询错误:', err);
      res.status(500).json({ message: '数据库查询失败' });
    }
  });

// 启动服务器并监听请求
app.listen(port, () => {
    console.log(`服务器正在监听 http://localhost:${port}`);
});
