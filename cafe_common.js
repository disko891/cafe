
const express = require("express");
const path = require("path");
const db = require("./db");

// Express 앱 생성
function createApp() {
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  app.use(express.urlencoded({ extended: false }));

  return app;
}

// 비동기 오류 처리
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

// 정수 확인
function integer(value) {
  if (typeof value !== "string" || !/^-?\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) ? number : null;
}

// 오류 화면 출력
function showError(res, status, message) {
  return res.status(status).render("cafe_error", { message });
}

// 서버 실행
function start(app) {
  app.use((err, req, res, next) => {
    console.error("서버 오류:", err);

    if (res.headersSent) {
      return next(err);
    }

    showError(
      res,
      500,
      "요청 처리에 실패했습니다. MySQL 연결과 cafe_menu 테이블을 확인하세요."
    );
  });

  const port = Number(process.env.PORT || 3000);

  const server = app.listen(port, () => {
    console.log(`카페 메뉴 관리: http://localhost:${port}`);
  });

  server.on("error", (err) => {
    console.error("서버 실행 오류:", err.message);
    process.exitCode = 1;
  });

  const shutdown = () => {
    server.close(async () => {
      await db.end();
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

module.exports = {
  db,
  createApp,
  asyncHandler,
  integer,
  showError,
  start
};

