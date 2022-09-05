# 아이템 12. 함수 표현식에 타입 적용하기

> **타입스크립트에서는 함수 표현식을 사용하는 것이 좋다.**

---

자바스크립트 그리고 타입스크립트에서는 함수 문장과 함수 표현식을 다르게 인식한다. 타입스크립트에서는 함수 표현식을 사용하는 것이 좋은데, 함수의 매개변수부터 반환값까지 전체를 함수 타입으로 선언하여 함수 표현식에 재사용할 수 있는 장점이 있기 때문이다.

```jsx
function rollDice1(sides: number): number {
  /* COMPRESS */ return 0; /* END */
} // Statement
const rollDice2 = function (sides: number): number {
  /* COMPRESS */ return 0; /* END */
}; // Expression
const rollDice3 = (sides: number): number => {
  /* COMPRESS */ return 0; /* END */
}; // Also expression
```

편집기에서 slides에 마우스를 올려 보면, 타입스크립트에서는 이미 slides의 타입을 number로 인식하고 있다.

```jsx
type DiceRollFn = (sides: number) => number;
const rollDice: DiceRollFn = (sides) => {
  /* COMPRESS */ return 0; /* END */
};
```

함수 타입 선언은 불필요한 코드의 반복을 줄인다. 사칙연산을 하는 함수 네 개는 반복되는 함수 시그니처를 하나의 함수 타입으로 통합할 수 있다.

```jsx
type BinaryFn = (a: number, b: number) => number;
const add: BinaryFn = (a, b) => a + b;
const sub: BinaryFn = (a, b) => a - b;
const mul: BinaryFn = (a, b) => a * b;
const div: BinaryFn = (a, b) => a / b;
```

라이브러리는 공통 함수 시그니처를 타입으로 제공한다. 예를 들어 리엑트는 함수의 매개변수에 명시하는 MouseEvent 타입 대신에 함수 전체에 적용할 수 있는 MouseEventHandler 타입을 제공한다.

```jsx
const handleClick: MouseEventHandler = (e) => {
  console.log(e.target);
};

const handleClick = (e: MouseEvent) => {
  console.log(e.target);
};
```

시그니처가 일치하는 다른 함수가 있을 때도 함수 표현식에 타입을 적용해볼 만하다. 예를 들어, fetch 함수는 특정 리소스에 HTTP 요청을 보낸다. 그리고, response.json(), response.text()를 통해 응답의 데이터를 추출하는데 만약, /quote가 존재하지 않는 API라면, ‘404 Not Found’가 포함된 값을 응답받게 된다. 이 응답은 JSON 형식이 아닐 수 있으며 response.json()에서 response가 JSON 형식이 아니라는 새로운 오류 메세지를 담아 거절한다. 즉, 실제 오류인 404는 감춰지게 된다.

또한, fetch가 실패하면 거절된 프로미스를 응답하지 않으니, 이를 위해 상태 체크를 수행할 checkedFetch 함수를 아래와 같이 작성할 수 있다. fetch의 타입 선언은 _lib.dom.d.ts_ 에 있다.

```jsx
declare function fetch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response>;
```

함수 표현식의 함수 전체 타입 (typeof fetch)를 적용하여 타입스크립트가 input과 init 타입을 추론할 수 있게 해준다. 타입 구문은 또한 checkedFetch 반환 타입을 보장하며, fetch와 동일하다. 또한, throw 대신 return을 사용했다면, 그 실수 또한 잡아낸다.

```jsx
const checkedFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error("Request failed: " + response.status);
  }
  return response;
};
```

함수의 매개변수에 타입 선언을 하는 것보다 함수 표현식 전체 타입을 정의하는 것이 새 함수를 작성하거나, 동일한 타입 시그니처를 가지는 여러 개의 함수를 작성할 때 함수 전체의 타입 선언을 적용하는 것이 좋다.
