const inputs = require("fs")
  .readFileSync("./test.txt")
  .toString()
  .trim()
  .split("\n");

const [studCount, testCount] = inputs.shift().split(' ').map(Number);

function solution(studCount, testCount, result) {
  let answer = 0;
  result = result.map(i => i.split(' ').map(Number));
  
  for (let i=1;i<=studCount;i++) {
    for (let j=1; j<=studCount;j++) {
      let cnt = 0;
      for (let test=0; test<testCount;test++) {
        let pi=pj=0;
        for (let lank=0; lank <studCount;lank++) {
          if (result[test][lank] === i) pi = lank;
          if (result[test][lank] === j) pj = lank;
        }
        if (pi > pj) cnt++;
      }
      if (cnt === testCount) answer++;
    }
  }

  return answer;
}

console.log(solution(studCount, testCount, inputs));
