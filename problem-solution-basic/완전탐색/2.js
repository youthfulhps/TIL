const inputs = require("fs")
.readFileSync("./test.txt")
.toString()
.trim()
.split("\n");

const n = Number(inputs.shift());

const numbers = inputs.shift().split(' ');

function isPrime (n) {
  if (n===1) return false;
  for (let i =2;i<parseInt(Math.sqrt(n));i++) {
    if (n===i) continue;
    if (n%i === 0) {
      return false;
    }
  }
  return true;
}

function solution(n, numbers) {
  const answer = [];
  for (let number of numbers) {
    const reverse = Number(number.split('').reverse().join(''));
    if (isPrime(reverse)) answer.push(reverse);
  }
  
  return answer.join(' ');
}

console.log(solution(n, numbers));