const inputs = require("fs")
  .readFileSync("./test.txt")
  .toString()
  .trim()
  .split("\n");

const n = Number(inputs.shift());

const numbers = inputs.shift().split(' ');

function solution(n, numbers) {
  let answer = 0;
  let max = Number.MIN_SAFE_INTEGER;
  for (let number of numbers) {
    const strArr = number.split('');
    const sum = strArr.reduce((sum, cur) => sum + Number(cur), 0);

    if (sum > max) {
      answer = number;  
      max = sum;
    } else if (sum === max) {
      answer = Math.max(answer, Number(number));
    } 

    max = Math.max(max, sum);  
    
  }

  return answer;
}

console.log(solution(n,numbers));