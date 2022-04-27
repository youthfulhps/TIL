# 아이템 41. any의 진화를 이해하기

타입스크립트에서 일반적으로 변수의 타입은 변수를 선언할 때 결정된다. 그 후에 정제될 수 있지만, 새로운 값이 추가되도록
확장할 수는 없다. 자바스크립트에서 일정 범위의 숫자들을 생성하는 함수를 예로 들어 보자.

```js
function range(start, limit) {
  const out = [];
  for (let i = start; i < limit; i++) {
    out.push(i);
  }
  return out;
}
```

```ts
function range(start: number, limit: number) {
  const out = [];
  for (let i = start; i < limit; i++) {
    out.push(i);
  }
  return out; // Return type inferred as number[]
}
```

타입스크립트로 변환된 코드는 예상한대로 정확히 동작한다. 그러나, 자세히 살펴보면 한 가지 이상한 점을 발견할 수 있다.
out의 타입이 처음에는 any 타입 배열인 []로 초기화되었는데, 마지막에는 number[]로 추론되고 있다.

코드에 등장하는 out의 세 가지 위치를 조사해보면 이유를 알 수 있다. **out의 타입은 any[]로 선언되었지만, number 타입의 값을
넣는 순간부터 타입은 number[]로 진화한다.** 이는, 타입 좁히기와는 다르다. 배열의 다양한 타입의 요소를 넣으면 배열의 타입이 확장되며 진화한다.

```ts
function range(start: number, limit: number) {
  const out = []; // Type is any[]
  for (let i = start; i < limit; i++) {
    out.push(i); // Type of out is any[]
  }
  return out; // Type is number[]
}
```

또한, **조건문에서는 분기에 따라 타입이 변할 수도 있다.** 다음 코드에서는 배열이 아닌 단순 값으로 예를 들어 보자.
변수의 초깃값이 null인 경우도 any의 진화가 일어난다.

```ts
let val; // Type is any
if (Math.random() < 0.5) {
  val = /hello/;
  val; // Type is RegExp
} else {
  val = 12;
  val; // Type is number
}
val; // Type is number | RegExp
```

보통은 **try/catch 블록 안에서 변수를 할당하는 경우에 나타난다.**

```ts
function somethingDangerous() {}
let val = null; // Type is any
try {
  somethingDangerous();
  val = 12;
  val; // Type is number
} catch (e) {
  console.warn("alas!");
}
val; // Type is number | null
```

**any 타입의 진화는 `noImplicitAny`가 설정된 상태에서 변수의 타입이 암시적 any 인 경우에만 일어난다.**
그러나, 다음처럼 **명시적으로 any를 선언하면 타입이 그대로 유지된다.**

```ts
let val: any; // Type is any
if (Math.random() < 0.5) {
  val = /hello/;
  val; // Type is any
} else {
  val = 12;
  val; // Type is any
}
val; // Type is any
```

any 타입의 진화는 암시적 any 타입에 어떤 값을 할당할 때만 발생한다. 그리고, 어떤 변수가 암시적 any 상태일 때
값을 읽으려고 하면 오류가 발생한다. 암시적 any 타입은 함수 호출을 거쳐도 진화하지 않는다.
다음 코드에서 forEach 안의 화살표 함수는 추론에 영향을 미치지 않는다.

```ts
function makeSquares(start: number, limit: number) {
  const out = [];
  // ~~~ Variable 'out' implicitly has type 'any[]' in some locations
  range(start, limit).forEach((i) => {
    out.push(i * i);
  });
  return out;
  // ~~~ Variable 'out' implicitly has an 'any[]' type
}
```

앞의 코드와 같은 경우라면 루프로 순회하는 대신, 배열의 map과 filter 메서드를 통해 단일 구문을 통해 배열을 생성하여
any 전체를 진화시키는 방법을 생각해볼 수 있다.

any가 진화하는 방식은 일반적인 변수가 추론되는 원리와 동일하다. 예를 들어, 진화한 배열의 타입이 (string | number)[] 라면,
원래 number[] 타입이어야 하지만, 실수로 string이 섞여서 잘못 진화한 것일 수 있다. 타입을 안전하게 지키기 위해서는
암시적 any를 진화시키는 방식보다 명시적 타입 구문을 사용하는 것이 더 좋은 설계이다.

결과적으로, 일반적인 타입들은 정제되기도 하는 반면, 암시적 any와 any[]타입은 진화할 수 있다. 이러한 동작이 발생하는 코드를
인지하고 이해할 수 있어야 한다. any를 진화시키는 방식보다 명시적 타입 구문을 사용하는 것이 안전한 타입을 유지하는 방법이다.
