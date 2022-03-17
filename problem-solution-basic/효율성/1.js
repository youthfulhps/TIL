//two pointers

const inputs = require("fs")
  .readFileSync("./test.txt")
  .toString()
  .trim()
  .split("\n");

const n = inputs.shift();
const arr1 = inputs.shift().split('').map(Number);
const m = inputs.shift();
const arr2 = inputs.shift().split('').map(Number);

function solution(m, n, arr1, arr2) {
  let p1=p2=0;
  const result = [];
  
  while (p1<n && p2<m) {
    if (arr1[p1] <= arr2[p2]) result.push(arr1[p1++]);
    else result.push(arr2[p2++]);
  }

  result.push(...arr1.slice(p1, -1));
  result.push(...arr2.slice(p2, -1));
  
  return result;
}

console.log(solution(m, n, arr1, arr2));