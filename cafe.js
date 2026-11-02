
const {
  db,
  createApp,
  asyncHandler,
  integer,
  showError,
  start
} = require("./cafe_common");

const app = createApp();

// 메뉴 입력값 검증
function menuInput(body) {
  const menu = typeof body.menu === "string"
    ? body.menu.trim()
    : "";

  const price = integer(body.price);
  const quantity = integer(body.quantity);

  if (
    !menu ||
    [...menu].length > 100 ||
    price === null ||
    price < 0 ||
    price > 2147483647 ||
    quantity === null ||
    quantity < 0 ||
    quantity > 2147483647
  ) {
    return null;
  }

  return { menu, price, quantity };
}

// 1. 전체 메뉴 조회
app.get("/", asyncHandler(async (req, res) => {
  const [menus] = await db.execute(
    "SELECT id, menu, price, quantity FROM cafe_menu ORDER BY id DESC"
  );

  res.render("cafe", {
    menus,
    selected: null
  });
}));

// 2. ID 상세 조회
app.get("/menus/:id", asyncHandler(async (req, res) => {
  const id = integer(req.params.id);

  if (id === null || id <= 0) {
    return showError(res, 400, "올바른 ID를 입력하세요.");
  }

  const [rows] = await db.execute(
    "SELECT id, menu, price, quantity FROM cafe_menu WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return showError(res, 404, "해당 메뉴를 찾을 수 없습니다.");
  }

  const [menus] = await db.execute(
    "SELECT id, menu, price, quantity FROM cafe_menu ORDER BY id DESC"
  );

  res.render("cafe", {
    menus,
    selected: rows[0]
  });
}));

// 3. 메뉴 추가
app.post("/menus/add", asyncHandler(async (req, res) => {
  const input = menuInput(req.body);

  if (!input) {
    return showError(res, 400, "메뉴명, 가격, 수량을 확인하세요.");
  }

  await db.execute(
    "INSERT INTO cafe_menu (menu, price, quantity) VALUES (?, ?, ?)",
    [input.menu, input.price, input.quantity]
  );

  res.redirect(303, "/");
}));

// 4. 메뉴 수정
app.post("/menus/edit", asyncHandler(async (req, res) => {
  const id = integer(req.body.id);
  const input = menuInput(req.body);

  if (id === null || id <= 0 || !input) {
    return showError(res, 400, "수정할 메뉴의 입력값을 확인하세요.");
  }

  const [result] = await db.execute(
    "UPDATE cafe_menu SET menu = ?, price = ?, quantity = ? WHERE id = ?",
    [input.menu, input.price, input.quantity, id]
  );

  if (result.affectedRows === 0) {
    return showError(res, 404, "수정할 메뉴가 없습니다.");
  }

  res.redirect(303, "/");
}));

// 5. 메뉴 삭제
app.post("/menus/delete", asyncHandler(async (req, res) => {
  const id = integer(req.body.id);

  if (id === null || id <= 0) {
    return showError(res, 400, "삭제할 메뉴 ID를 확인하세요.");
  }

  const [result] = await db.execute(
    "DELETE FROM cafe_menu WHERE id = ?",
    [id]
  );

  if (result.affectedRows === 0) {
    return showError(res, 404, "삭제할 메뉴가 없습니다.");
  }

  res.redirect(303, "/");
}));

// 서버 실행
start(app);

