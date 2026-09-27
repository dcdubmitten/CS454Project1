const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

let passed = 0;
let failed = 0;

async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  const text = await response.text();

  let body;

  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return {
    status: response.status,
    body
  };
}

function assert(condition, message) {
  if (condition) {
    console.log(`PASS: ${message}`);
    passed++;
  } else {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log(`Testing ${BASE_URL}`);
  console.log("");

  let result = await request("/health");

  assert(
    result.status === 200 &&
      result.body.status === "ok",
    "GET /health returns 200 and status ok"
  );

  result = await request("/stats");

  assert(
    result.status === 200 &&
      Number.isInteger(result.body.conversions),
    "GET /stats returns an integer conversion count"
  );

  const startingCount = result.body.conversions;

  result = await request("/convert?lbs=0");

  assert(
    result.status === 200 &&
      result.body.lbs === 0 &&
      result.body.kg === 0 &&
      result.body.formula === "kg = lbs * 0.45359237",
    "GET /convert?lbs=0 returns 200 and kg=0"
  );

  result = await request("/convert?lbs=150");

  assert(
    result.status === 200 &&
      result.body.lbs === 150 &&
      result.body.kg === 68.039 &&
      result.body.formula === "kg = lbs * 0.45359237",
    "GET /convert?lbs=150 returns 200 and kg=68.039"
  );

  result = await request("/convert?lbs=0.1");

  assert(
    result.status === 200 &&
      result.body.lbs === 0.1 &&
      result.body.kg === 0.045,
    "GET /convert?lbs=0.1 returns 200 and kg=0.045"
  );

  result = await request("/convert");

  assert(
    result.status === 400,
    "GET /convert without lbs returns 400"
  );

  result = await request("/convert?lbs=abc");

  assert(
    result.status === 400,
    "GET /convert?lbs=abc returns 400"
  );

  result = await request("/convert?lbs=-5");

  assert(
    result.status === 422,
    "GET /convert?lbs=-5 returns 422"
  );

  result = await request("/stats");

  const expectedCount = startingCount + 3;

  assert(
    result.status === 200 &&
      result.body.conversions === expectedCount,
    `GET /stats reports ${expectedCount} after three successful conversions`
  );

  console.log("");
  console.log(`Tests passed: ${passed}`);
  console.log(`Tests failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }

  console.log("All tests passed.");
}

runTests().catch((error) => {
  console.error("Test execution failed:", error);
  process.exit(1);
});
