//Hash

const inputs = require("fs")
  .readFileSync("./test.txt")
  .toString()
  .trim()
  .split("\n");

const N = Number(inputs.shift());
const arr = inputs.shift().split('');

function solution (N, arr) {
  const hash = new Map();
  let max = Number.MIN_SAFE_INTEGER;
  let answer = '';

  for (let value of arr) {
    if (hash.has(value)) {
      hash.set(value, hash.get(value) +1);
    } else {
      hash.set(value, 1);
    }
  }

  for (let [key, value] of hash) {
    if (value > max) {
      max = value;
      answer = key;
    }
  }

  return answer;
}

console.log(solution(N, arr));