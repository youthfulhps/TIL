const inputs = require("fs")
  .readFileSync("./test.txt")
  .toString()
  .trim()
  .split("\n");

const [S, T] = inputs;

function isSameMap (A, B) {
  if (A.size !== B.size) return false;
  for (let [key, value] of A) {
    if (!B.has(key) || value !== B.get(key)) return false;
  }
  
  return true;
}

function solution (S, T) {
  let answer = 0;

  const tHash = new Map();
  const sHash = new Map();

  //비교 문자열에 대한 해시를 생성한다
  for (let i of T) {
    if (tHash.has(i)) {
      tHash.set(i, tHash.get(i) + 1); 
    } else {
      tHash.set(i, 1);
    }
  }

  //해시에 값을 추가할 때마다 비교를 해주어야 하기 때문에 
  //초기 sHash는 t의 길이보다 하나 작은 길이 만큼만 sHash에 추가한다

  for (let i=0; i<T.length-1; i++) {
    if (sHash.has(S[i])) {
      sHash.set(S[i], tHash.get(S[i]) + 1); 
    } else {
      sHash.set(S[i], 1);
    } 
  }

  let lt = 0;
  //그 다음 값을 해시에 추가하고, 두 해시를 비교하여 동일한지 확인한다
  //만약 같다면, 카운트를 하나 상승
  //이후, 윈도우를 슬라이딩해준다
  //상단 로직에서 추가하기 때문에 첫 인덱스의 삭제 작업만 진행한다
  for (let rt=T.length-1;rt<S.length; rt++) {
    if (sHash.has(S[rt])) {
      sHash.set(S[rt], tHash.get(S[rt]) + 1); 
    } else {
      sHash.set(S[rt], 1);
    } 

    if (isSameMap(tHash, sHash)) answer++;
    sHash.set(S[lt], sHash.get(S[lt]) -1);
    if (sHash.get(S[lt]) === 0) sHash.delete(S[lt]);
    lt++;
  }

  return answer;
}


console.log(solution(S, T));