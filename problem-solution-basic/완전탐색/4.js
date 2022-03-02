const inputs = require("fs")
  .readFileSync("./test.txt")
  .toString()
  .trim()
  .split("\n");

const [n, money] = inputs.shift().split(' ').map(Number);

function solution(n, money, gifts) {
  let answer = Number.MIN_SAFE_INTEGER;

  gifts = gifts.map(gift => gift.split(' ')
    .map(Number)).sort((a, b)=> (a[0] + a[1]) - (b[0] + b[1]));

  for (let i=0;i<n;i++) {
    let current = money - gifts[i][0]/2 + gifts[i][1];
    let cnt = 1;

    for (let j=0; j<n;j++) {
      if (j!==i && gifts[j][0] + gifts[j][1] > current) break;
      if (j!==i && gifts[j][0] + gifts[j][1] <=current) {
        current -= gifts[j][0] + gifts[j][1];
        cnt++;
      }

      answer = Math.max(answer, cnt);
    }
  }
  
  return answer;
}

console.log(solution(n, money, inputs));
