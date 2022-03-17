//Sliding window

const inputs = require("fs")
  .readFileSync("./test.txt")
  .toString()
  .trim()
  .split("\n");

const [N, K] = inputs.shift().split(' ').map(Number);
const arr = inputs.shift().split(' ').map(Number);

function solution(N, K, arr) {
  let answer = 0;
  let sum = 0;

  for (let i=0;i<K;i++) sum+=arr[i];
  answer = sum;

  for (let i=K;i<N;i++) {
    sum+= arr[i] - arr[i-K];
    answer = Math.max(answer, sum);
  }

  return answer;
}

console.log(solution(N, K, arr));