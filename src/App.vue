<template>
  <div id="app">
    <header>
      <h1>学生成绩管理系统</h1>
    </header>

    <main>
      <!-- 模块1：加载所有学生数据 -->
      <section class="card">
        <h2>309镇宇班学生成绩</h2>
        <!-- 按钮：展示排名 -->
        <button class="btn" @click="fetchStudents">展示排名</button>
        <!-- 按钮：打开查询学生弹窗 -->
        <button class="btn" @click="openQueryModal">查询学生</button>
        <!-- 按钮：打开添加学生弹窗 -->
        <button class="btn" @click="openAddStudentModal">添加新学生</button>
        
        <!-- 数据加载中的提示 -->
        <div v-if="isLoading" class="loading">数据加载中...</div>
        
        <!-- 学生列表表格 -->
        <table v-if="students.length && !isLoading">
          <thead>
            <tr>
              <th>排名</th>
              <th>学号</th>
              <th>姓名</th>
              <th>语文</th>
              <th>英语</th>
              <th>数学</th>
              <th>平均成绩</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td>{{ student.rank }}</td>
              <td>{{ student.id }}</td>
              <td>{{ student.name }}</td>
              <td>{{ student.score1 }}</td>
              <td>{{ student.score2 }}</td>
              <td>{{ student.score3 }}</td>
              <td>{{ formatAvg(student.avg) }}</td>
              <td>
                <!-- 编辑和删除按钮 -->
                <button class="btn btn-edit" @click="editStudentInfo(student)">编辑</button>

                <button class="btn btn-delete" @click="deleteStudent(student.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <!-- 编辑学生弹窗（修改后） -->
      <div v-if="isEditStudentModalOpen" class="modal-overlay">
        <div class="modal-content">
          <h2>编辑学生信息</h2>
          <form @submit.prevent="updateStudent">
            <div class="form-group">
              <label>学号:</label>
              <input type="number" v-model="editStudentData.id" required disabled />
            </div>
            <div class="form-group">
              <label>姓名:</label>
              <input type="text" v-model="editStudentData.name" required />
            </div>
            <div class="form-group">
              <label>语文:</label>
              <input type="number" v-model.number="editStudentData.score1" required min="0" max="150" />
            </div>
            <div class="form-group">
              <label>英语:</label>
              <input type="number" v-model.number="editStudentData.score2" required min="0" max="150" />
            </div>
            <div class="form-group">
              <label>数学:</label>
              <input type="number" v-model.number="editStudentData.score3" required min="0" max="150" />
            </div>
            <button class="btn" type="submit">保存</button>
            <button class="btn btn-cancel" @click="closeEditStudentModal">关闭</button>
          </form>
        </div>
      </div>
 

      <!-- 查询学生弹窗 -->
      <div v-if="isQueryModalOpen" class="modal-overlay">
        <div class="modal-content">
          <h2>查询学生</h2>
          <div class="query-container">
            <!-- ID 查询 -->
            <div class="query-box">
              <h3>根据学号查询</h3>
              <form @submit.prevent="searchById">
                <input type="number" v-model="search.id" placeholder="请输入学生学号" required>
                <button class="btn" type="submit">查询</button>
              </form>
              <div v-if="searchResult">
                <table class="student-table">
                  <thead>
                    <tr>
                      <th>学号</th>
                      <th>姓名</th>
                      <th>语文</th>
                      <th>英语</th>
                      <th>数学</th>
                      <th>平均成绩</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{{ searchResult.id }}</td>
                      <td>{{ searchResult.name }}</td>
                      <td>{{ searchResult.score1 }}</td>
                      <td>{{ searchResult.score2 }}</td>
                      <td>{{ searchResult.score3 }}</td>
                      <td>{{ formatAvg(searchResult.avg) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 姓名模糊查询 -->
            <div class="query-box">
              <h3>根据姓名模糊查询</h3>
              <form @submit.prevent="searchByName">
                <input type="text" v-model="search.name" placeholder="请输入学生姓名" required>
                <button class="btn" type="submit">查询</button>
              </form>
              <div v-if="nameSearchResults.length">
                <table>
                  <thead>
                    <tr>
                      <th>学号</th>
                      <th>姓名</th>
                      <th>语文</th>
                      <th>英语</th>
                      <th>数学</th>
                      <th>平均成绩</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="student in nameSearchResults" :key="student.id">
                      <td>{{ student.id }}</td>
                      <td>{{ student.name }}</td>
                      <td>{{ student.score1 }}</td>
                      <td>{{ student.score2 }}</td>
                      <td>{{ student.score3 }}</td>
                      <td>{{ formatAvg(student.avg) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <button class="btn btn-cancel" @click="closeQueryModal">关闭</button>
        </div>
      </div>

      <!-- 添加学生弹窗 -->
      <div v-if="isAddStudentModalOpen" class="modal-overlay">
        <div class="modal-content">
          <h2>添加新学生</h2>
          <form @submit.prevent="addStudent">
            <div class="form-group">
              <label>学号:</label>
              <input type="number" v-model="newStudent.id" required>
            </div>
            <div class="form-group">
              <label>姓名:</label>
              <input type="text" v-model="newStudent.name" required>
            </div>
            <div class="form-group">
              <label>语文:</label>
              <input type="number" v-model.number="newStudent.score1" required min="0" max="150">
            </div>
            <div class="form-group">
              <label>英语:</label>
              <input type="number" v-model.number="newStudent.score2" required min="0" max="150">
            </div>
            <div class="form-group">
              <label>数学:</label>
              <input type="number" v-model.number="newStudent.score3" required min="0" max="150">
            </div>
            <button class="btn" type="submit">添加学生</button>
            <button class="btn btn-cancel" @click="closeAddStudentModal">关闭</button>
          </form>
          <p class="message">{{ addMessage }}</p>
        </div>
      </div>
    </main>

    <footer>
      <p>© 2025 学生管理系统</p>
      <button class="contact-btn" @click="showContact">联系我们</button>
    </footer>
  </div>
</template>

<script>
// 引入 Vue 和 axios
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'App',
  setup() {
    const isEditStudentModalOpen = ref(false); // 控制编辑学生弹窗的显示
    
    const baseUrl = 'http://localhost:3000'; // 设置API接口的基础URL
    const students = ref([]); // 学生列表
    const search = ref({ id: '', name: '' }); // 搜索条件（学号、姓名）
    const searchResult = ref(null); // 查询结果
    const nameSearchResults = ref([]); // 姓名模糊查询结果
    const newStudent = ref({ id: '', name: '', score1: null, score2: null, score3: null }); // 新学生信息
    const addMessage = ref(''); // 添加学生后的反馈消息
    const isLoading = ref(false); // 数据加载状态

    // 控制弹窗的显示
    const isQueryModalOpen = ref(false); 
    const isAddStudentModalOpen = ref(false); 

    // 格式化平均成绩（保留两位小数）
    const formatAvg = (value) => {
      return value ? value.toFixed(2) : '0.00';
    };

    const showContact = () => {
      alert('联系方式:\nqq:1933953319');
    };

    // 获取学生数据并排序
    const fetchStudents = async () => {
      isLoading.value = true;
      try {
        const res = await axios.get(`${baseUrl}/students`);
        students.value = res.data
          .sort((a, b) => b.avg - a.avg) // 按平均成绩排序
          .map((student, index) => ({ ...student, rank: index + 1 })); // 添加排名字段
      } catch (error) {
        console.error('加载失败:', error);
      } finally {
        isLoading.value = false;
      }
    };

    // 根据学号查询学生
    const searchById = async () => {
      try {
        nameSearchResults.value = [];
        const res = await axios.get(`${baseUrl}/students/id/${search.value.id}`);
        searchResult.value = res.data;
      } catch {
        searchResult.value = null;
        alert('未找到该学生');
      }
    };

    // 根据姓名查询学生
    const searchByName = async () => {
      try {
        searchResult.value = null;
        const res = await axios.get(`${baseUrl}/students/name/${search.value.name}`);
        nameSearchResults.value = res.data;
      } catch {
        nameSearchResults.value = [];
        alert('未找到匹配学生');
      }
    };

    // 添加新学生前的验证
    const validateStudent = (student) => {
      const scores = [student.score1, student.score2, student.score3];
      return scores.every(score => score >= 0 && score <= 150); // 分数范围验证
    };

    // 添加新学生
    const addStudent = async () => {
      if (!validateStudent(newStudent.value)) {
        addMessage.value = '分数必须在0-150之间';
        return;
      }

      try {
        // 向后端发送请求，添加新学生
        const res = await axios.post(`${baseUrl}/students`, newStudent.value);
        if (res.status === 201) {
          // 学生添加成功，更新学生列表
          addMessage.value = '学生添加成功';
          fetchStudents(); // 刷新学生列表
          closeAddStudentModal(); // 关闭弹窗
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // 如果返回400，说明学号已存在
          addMessage.value = '该学号的学生已存在';
        } else {
          // 其他错误
          addMessage.value = '添加失败，请重试';
        }
        console.error('添加失败:', error);
      }
    };

    // 删除学生
    const deleteStudent = async (id) => {
      try {
        await axios.delete(`${baseUrl}/students/${id}`);
        students.value = students.value.filter(student => student.id !== id); // 更新学生列表
      } catch (error) {
        console.error('删除失败:', error);
      }
    };

    // 打开查询学生弹窗
    const openQueryModal = () => {
      isQueryModalOpen.value = true;
    };

    // 关闭查询学生弹窗
    const closeQueryModal = () => {
      isQueryModalOpen.value = false;
      search.value = { id: '', name: '' }; // 清空查询条件
      searchResult.value = null;
      nameSearchResults.value = [];
    };

    // 打开添加学生弹窗
    const openAddStudentModal = () => {
      isAddStudentModalOpen.value = true;
    };

    // 关闭添加学生弹窗
    const closeAddStudentModal = () => {
      isAddStudentModalOpen.value = false;
      newStudent.value = { id: '', name: '', score1: null, score2: null, score3: null }; // 清空表单
      addMessage.value = ''; // 清空提示信息
    };

    // 定义编辑学生数据的响应式变量（使用 editStudentData 避免与函数重名）
    const editStudentData = ref({ id: '', name: '', score1: null, score2: null, score3: null });

    // 打开编辑学生信息弹窗
    const editStudentInfo = (student) => {
      editStudentData.value = { ...student }; // 填充学生信息
      isEditStudentModalOpen.value = true;
    };

    // 保存更新后的学生信息
    const updateStudent = async () => {
      try {
        const res = await axios.put(`${baseUrl}/students/${editStudentData.value.id}`, editStudentData.value);
        if (res.status === 200) {
          // 更新成功，关闭弹窗并刷新学生列表
          fetchStudents();
          closeEditStudentModal();
        }
      } catch (error) {
        console.error('更新失败:', error);
      }
    };

    // 关闭编辑学生弹窗
    const closeEditStudentModal = () => {
      isEditStudentModalOpen.value = false;
      editStudentData.value = { id: '', name: '', score1: null, score2: null, score3: null }; // 清空编辑表单
    };

    // 编辑学生信息的处理方法（保留函数名 editStudent 供其他调用，如有需要）
    const editStudent = (student) => {
      editStudentInfo(student);
    };

    return {
      students,
      search,
      searchResult,
      nameSearchResults,
      newStudent,
      addMessage,
      isLoading,
      isQueryModalOpen,
      isAddStudentModalOpen,
      formatAvg,
      showContact,
      fetchStudents,
      searchById,
      searchByName,
      addStudent,
      deleteStudent,
      openQueryModal,
      closeQueryModal,
      openAddStudentModal,
      closeAddStudentModal,
      isEditStudentModalOpen,
      editStudent, // 作为点击编辑按钮的处理函数（也可直接使用 editStudentInfo）
      updateStudent,
      closeEditStudentModal,
      editStudentInfo,
      editStudentData // 返回编辑学生的数据变量，用于编辑窗口绑定
    };
  },
};
</script>













<style scoped>
/* 新增样式 */
.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

@media (max-width: 768px) {
  .query-container {
    flex-direction: column;
  }
  .query-box {
    width: 100%;
    margin-bottom: 20px;
  }
  .modal-content {
    width: 90%;
    margin: 10px;
    padding: 15px;
  }
}

.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 700px;
  width: 100%;
}

.query-container {
  display: flex;
  justify-content: space-between;
}

.query-box {
  width: 45%;
}

.btn-cancel {
  background-color: #777;
}

.btn-cancel:hover {
  background-color: #555;
}
</style>
<style scoped>
/* 全局基础样式 */
* {
  box-sizing: border-box;
}

body, html, #app {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9f9f9;
  color: #333;
}

/* 头部样式 */
header {
  background: linear-gradient(90deg, #7483b5,#294bbc);  
  color: #ffffff;
  padding: 20px;
  text-align: center;
}

/* 主体区域样式 */
main {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 底部样式 */
footer {
  text-align: center;
  padding: 10px;
  font-size: 0.9em;
  color: #666;
}

/* 卡片样式：用于包裹每个功能模块 */
.card {
  max-width: 1200px; /* 限制最大宽度 */
  margin: 30px auto; /* 上下间距30px,左右自动居中 */
  text-align: center; /* 内容居中 */
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  padding: 20px;
}

/* 表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.student-table th:nth-child(2),
.student-table td:nth-child(2) {
  min-width: 150px; /* 适当增大 */
  white-space: nowrap; /* 防止换行 */
}

th, td {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}
th {
  background-color: #f2f2f2;
}

/* 表单和按钮样式 */
form {
  margin-top: 10px;
}
.form-group {
  margin-bottom: 10px;
  display: fle;
  align-items: center;
}
.form-group label {
  width: 80px;
  font-weight: bold;
}
.form-group input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input[type="text"],
input[type="number"] {
  width: 100%;
}

/* 按钮样式 */
.btn {
  padding: 10px 15px;
  font-size: 16px; /* 增加字体大小 */
  margin: 10px 15px; /* 增加按钮之间的间距 */
  background-color: #4b7cb7;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 5px;
}
.btn:hover {
  background-color: #3a5591;
}

/* 编辑按钮样式 */
.btn-edit {
  background-color: #f0ad4e;
}
.btn-edit:hover {
  background-color: #ec971f;
}

/* 删除按钮样式 */
.btn-delete {
  background-color: #d9534f;
}
.btn-delete:hover {
  background-color: #c9302c;
}

/* 取消按钮样式 */
.btn-cancel {
  background-color: #777;
}
.btn-cancel:hover {
  background-color: #555;
}

/* 提示信息样式 */
.message {
  margin-top: 10px;
  font-size: 0.9em;
  color: #d9534f;
}

/* 查询结果容器样式 */
.result {
  margin-top: 10px;
  background: #eef;
  padding: 10px;
  border-radius: 4px;
}
/*联系方式样式*/
.contact-btn {
  background: linear-gradient(90deg, #ff7e5f, #feb47b);
  color: white;
  padding: 15px 40px;
  font-size: 11px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: 0.3s ease-in-out;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.contact-btn:hover {
  background: linear-gradient(90deg, #feb47b, #ff7e5f);
  transform: scale(1.05);
}


/* 弹窗样式修改 */
.modal-content {
  max-width: 900px;
  padding: 30px;
}
</style>
