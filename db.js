// 실습 4: mysql2 연결 설정
// ⚠️ password를 본인의 MySQL 비밀번호로 바꿀 것

const mysql = require("mysql2/promise");

// 커넥션 풀: 연결을 미리 만들어 두고 재사용한다
const pool = mysql.createPool({
  host: "localhost",
  user: "subjectid033",
  password: "subjectid033",
  database: "subjectdb033",
  connectionLimit: 5,
});

module.exports = pool;
