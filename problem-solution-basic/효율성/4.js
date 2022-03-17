//two pointers

const inputs = require("fs")
  .readFileSync("./test.txt")
  .toString()
  .trim()
  .split("\n");

const [n, sum] = inputs.shift().split('').map(Number);
const arr = inputs.shift().split('').map(Number);


function solution(n, sum, arr) {
  let count = 0;
  let lt=0;
  let tmpSum = 0;

  for (let rt=0; rt<n;rt++) {
    tmpSum+=arr[rt];
    while (tmpSum > sum) {
      tmpSum-=arr[lt++];
    }
    count+=rt-lt+1;
  }

  return count;
}

console.log(solution(n, sum, arr));