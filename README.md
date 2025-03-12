# 学生管理系统

## 项目简介
本项目是一个基于 Vue 3 + Node.js（Express）+ MariaDB 的学生管理系统，支持学生信息的增删改查（CRUD），并提供 RESTful API。

## 技术栈
- **前端**：Vue 3（Composition API）
- **后端**：Node.js + Express
- **数据库**：MariaDB（或 MySQL）
- **其他依赖**：cors、body-parser、mariadb

## 安装与运行
### 1. 克隆代码
```sh
git clone https://github.com/18757219260/Student_Management_System.git
cd ~yourdir/student-management
```

### 2. 配置数据库
确保本地安装了 MariaDB，并创建数据库 `student_db`。
```sql
CREATE DATABASE student_db;
USE student_db;

CREATE TABLE students (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    score1 INT NOT NULL,
    score2 INT NOT NULL,
    score3 INT NOT NULL,
    avg INT NOT NULL
);
```

### 3. 启动后端
```sh
cd backend  # 进入后端目录
npm install  # 安装依赖
node server.js  # 运行后端服务
```
后端运行在 `http://localhost:3000`

### 4. 启动前端
```sh
cd frontend  # 进入前端目录
npm install  # 安装依赖
npm run dev  # 启动前端
```
前端运行在 `http://localhost:5173`

## API 说明
### 获取所有学生
```
GET /students
```
- 返回所有学生信息，按 `avg` 降序排序

### 添加学生
```
POST /students
```
- **请求体**：`{ id, name, score1, score2, score3 }`
- **功能**：添加学生并计算平均分

### 更新学生信息
```
PUT /students/:id
```
- **请求体**：`{ score1, score2, score3 }`
- **功能**：更新学生成绩，并重新计算平均分

### 删除学生
```
DELETE /students/:id
```
- **功能**：删除指定学生信息

### 根据 ID 查询学生
```
GET /students/id/:id
```
- **功能**：根据学号查询学生

### 根据姓名模糊查询学生
```
GET /students/name/:name
```
- **功能**：根据姓名进行模糊查询

## 注意事项
- 数据库连接信息可在 `server.js` 中修改
- 生产环境建议使用 `.env` 存储数据库配置
- 确保后端和数据库正确连接，否则 API 将无法使用

## 许可证
MIT License

