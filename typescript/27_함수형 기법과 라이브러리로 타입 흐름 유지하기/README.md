# 아이템27. 함수형 기법과 라이브러리로 타입 흐름 유지하기

파이썬, C, 자바 등에서 볼 수 있는 표준 라이브러리는 자바스크립트에서 제공하고 있지 않다.
하지만, 많은 라이브러리(ex.jQuery, lodash, Ramda)들은 표준 라이브러리 역할을 해왔고,
이러한 라이브러리들의 일부 기능들(map, flatMap, filter, reduce)은 순수 자바스크립트로 구현되어 있다.

이러한 기법은 루프를 대체할 수 있기 때문에 자바스크립트에서 유용하게 사용되는데 타입스크립트와 조합해서 사용하면 더욱 빛을 발한다.
타입 정보가 그대로 유지되면서 타입 흐름이 계속 전달되도록 하기 때문이다.

예를 들어 CSV 데이터를 파싱한다면, 자바스크립트에서 절차형 프로그래밍 형태로 구현할 수 있다.

```js
const csvData = "...";
const rawRows = csvData.split("\n");
const headers = rawRows[0].split(",");

const rows = rawRows.slice(1).map((rowStr) => {
  const row = {};
  rowStr.split(",").forEach((val, j) => {
    row[header[j]] = val;
  });

  return row;
});
```

자바스크립트에서 함수형 프로그래밍 형태로 전개를 한다면 reduce를 사용할 수 있습니다.

```js
const rows = rawRows
  .slice(1)
  .map((rowStr) =>
    rowStr
      .split(",")
      .reduce((row, val, i) => ((row[headers[i]] = val), row), {})
  );
```

키와 값 배열로 취합해서 객체로 만들어주는 lodash의 zipObject 함수를 이용하면 코드는 더욱 간결해 집니다.

```js
import _ from "lodash";
const rows = rawRows
  .slice(1)
  .map((rowStr) => _.zipObject(headers, rowStr.split(",")));
```

자바스크립트에서는 프로젝트에 서드파티 라이브러리 종속성을 추가할 때 신중해야 한다. 만약 서드파티 라이브러리 기반으로
코드를 짧게 줄이는 데 시간이 많이 든다면, 사용하지 않는 게 낫기 때문이다.

그러나, 같은 코드를 타입스크립트로 작성한다면 서드파티 라이브러리를 사용하는 것이 무조건 유리하다.
타입 정보를 참고하며 작업할 수 있기 때문에 서드파티 라이브러리 기반으로 바꾸는 데 시간이 훨씬 단축된다.

위의 예제를 타입스크립트로 같은 코드를 작성하면 아래와 같은 에러가 발생한다. 두 오류 모두 {} 타입을 제공해주면 된다.
`{[column: string]: string}` 혹은 `Record<string, string>`

```ts
// requires node modules: @types/lodash

const csvData = "...";
const rawRows = csvData.split("\n");
const headers = rawRows[0].split(",");
import _ from "lodash";
const rowsA = rawRows.slice(1).map((rowStr) => {
  const row = {};
  rowStr.split(",").forEach((val, j) => {
    row[headers[j]] = val;
    // ~~~~~~~~~~~~~~~ No index signature with a parameter of
    //                 type 'string' was found on type '{}'
  });
  return row;
});
const rowsB = rawRows.slice(1).map((rowStr) =>
  rowStr.split(",").reduce(
    (row, val, i) => ((row[headers[i]] = val), row),
    // ~~~~~~~~~~~~~~~ No index signature with a parameter of
    //                 type 'string' was found on type '{}'
    {}
  )
);
```

반면에 lodash를 사용한 코드는 오류가 발생하지 않는다. `Dictionary`는 lodash의 타입 별칭이다.
`Dictionary<string>`은 `{[column: string]: string}` 혹은 `Record<string, string>`과 동일하다.
여기서 중요한 점은 타입 구문이 없어도 rows의 타입이 정확하다는 것이다.

```ts
// requires node modules: @types/lodash

const csvData = "...";
const rawRows = csvData.split("\n");
const headers = rawRows[0].split(",");
import _ from "lodash";
const rows = rawRows
  .slice(1)
  .map((rowStr) => _.zipObject(headers, rowStr.split(",")));
// Type is _.Dictionary<string>[]
```

데이터의 가공이 정교해질수록 장점은 더욱 분명해진다.

```ts
interface BasketballPlayer {
  name: string;
  team: string;
  salary: number;
}
declare const rosters: { [team: string]: BasketballPlayer[] };
```

루프를 사용해 단순(flat) 목록을 만들려면 배열에 concat을 사용해야 한다. 아래와 같은 코드는 동작하지만 타입 체크는 되지 않는다.

```ts
let allPlayers = [];
// ~~~~~~~~~~ Variable 'allPlayers' implicitly has type 'any[]'
//            in some locations where its type cannot be determined
for (const players of Object.values(rosters)) {
  allPlayers = allPlayers.concat(players);
  // ~~~~~~~~~~ Variable 'allPlayers' implicitly has an 'any[]' type
}
```

이 오류를 고치려면 allPlayers에 타입 구문을 추가해주면 되지만, 더 나은 해법은 Array.prototype.flat을 사용하는 것이다.

```ts
const allPlayers = Object.values(rosters).flat();
// OK, type is BasketballPlayer[]
```

flat 메서드는 다차원 배열을 평탄화해준다. 타입 시그니처는 `T[][] => T[]`와 같은 형태이다. 가장 간결하고 타입 구문 또한 필요없다.

내장된 함수형 기법들과 lodash같은 라이브러리에 타입 정보가 잘 유지되는 것은 우연이 아니다. 함수 호출 시 전달된 매개변수 값을 건드리지 않고
매번 새로운 값을 반환함으로써, 새로운 타입으로 안전하게 반환할 수 있다.

타입스크립트의 많은 부분이 자바스크립트 라이브러리의 동작을 정확히 모델링하기 위해서 개발되었다. 그러므로 라이브러리를 사용할 때 타입 정보가
잘 유지되는 점을 십분 활용해야 타입스크립트의 원래 목적을 달성할 수 있다.
