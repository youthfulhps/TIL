const inputs = require("fs")
  .readFileSync("./test.txt")
  .toString()
  .trim()
  .split("\n");

const [A, B] = inputs;

function solution(A,B) {
  const hash = new Map();

  for (let i of A) {
    if (hash.has(i)) hash.set(i, hash.get(i) +1);
    else hash.set(i, 0);
  }

  for (let i of B) {
    if (!hash.has(i) || hash.get(i) === 0) return 'NO'; 
    hash.set(i, hash.get(i) -1);
  }

  return 'YES';
}

console.log(solution(A, B));
