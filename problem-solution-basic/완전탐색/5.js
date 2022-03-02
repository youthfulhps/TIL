const inputs = require("fs")
  .readFileSync("./test.txt")
  .toString()
  .trim()
  .split("\n");

const [n, k] = inputs.shift().split(' ').map(Number);

function solution(n,k, numbers) {
  numbers = numbers.split(' ').map(Number);

  const tmp = new Set();

  for (let i=0; i<n;i++) {
    for (let j=i+1; j<n;j++) {
      for (let k=j+1; k<n;k++) {
        tmp.add(numbers[i] + numbers[j] + numbers[k]);
      }
    }
  }

  const answer = Array.from(tmp).sort((a,b) => b - a);
  return answer[k-1];
}

console.log(solution(n, k, inputs[0]))