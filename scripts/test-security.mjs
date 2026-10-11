import assert from 'node:assert';

// Emulate functions from security.ts
function getTimePinForDate(date, format = '24h') {
  let hours;
  if (format === '12h') {
    hours = date.getHours() % 12 || 12;
  } else {
    hours = date.getHours();
  }
  const minutes = date.getMinutes();
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  return `${hh}${mm}`;
}

function isValidTimePin(input, format = '24h', mockDate = new Date()) {
  const cleaned = input.trim();
  const now = mockDate;

  const currentPin = getTimePinForDate(now, format);
  if (cleaned === currentPin) return true;

  const prevMin = new Date(now.getTime() - 60 * 1000);
  if (cleaned === getTimePinForDate(prevMin, format)) return true;

  const nextMin = new Date(now.getTime() + 60 * 1000);
  if (cleaned === getTimePinForDate(nextMin, format)) return true;

  return false;
}

console.log('--- RUNNING SECURITY & PASSCODE TESTS ---');

// Test Case 1: Specific User requirement: 1:53 PM -> 1353
const d1 = new Date(2026, 9, 11, 13, 53, 20); // 1:53:20 PM
const pin1 = getTimePinForDate(d1, '24h');
assert.strictEqual(pin1, '1353', '1:53 PM must generate 1353');
console.log('✓ Test 1 Passed: 1:53 PM generated "1353"');

// Test Case 2: Specific User requirement: 11:06 AM -> 1106
const d2 = new Date(2026, 9, 11, 11, 6, 10); // 11:06:10 AM
const pin2 = getTimePinForDate(d2, '24h');
assert.strictEqual(pin2, '1106', '11:06 AM must generate 1106');
console.log('✓ Test 2 Passed: 11:06 AM generated "1106"');

// Test Case 3: Midnight 00:05 -> 0005
const d3 = new Date(2026, 9, 11, 0, 5, 0);
const pin3 = getTimePinForDate(d3, '24h');
assert.strictEqual(pin3, '0005', '00:05 must generate 0005');
console.log('✓ Test 3 Passed: 00:05 generated "0005"');

// Test Case 4: Tolerance Window (+/- 1 minute buffer)
const dNow = new Date(2026, 9, 11, 14, 30, 0); // 14:30
assert.ok(isValidTimePin('1430', '24h', dNow), 'Current minute 1430 matches');
assert.ok(isValidTimePin('1429', '24h', dNow), 'Previous minute 1429 matches due to buffer tolerance');
assert.ok(isValidTimePin('1431', '24h', dNow), 'Next minute 1431 matches due to buffer tolerance');
assert.ok(!isValidTimePin('1435', '24h', dNow), '1435 should not match at 14:30');
assert.ok(!isValidTimePin('9999', '24h', dNow), 'Invalid pin rejected');
console.log('✓ Test 4 Passed: Dynamic time tolerance window works seamlessly');

// Test Case 5: 12-hour format option (1:53 PM -> 0153)
const pin12h = getTimePinForDate(d1, '12h');
assert.strictEqual(pin12h, '0153', '1:53 PM in 12h mode should be 0153');
console.log('✓ Test 5 Passed: 12-hour mode correctly formats 0153');

console.log('ALL TESTS PASSED SUCCESSFULLY! 🎉');
