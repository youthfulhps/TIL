# 아이템22. 타입 좁히기

타입 좁히기는 타입 넓히기의 반대 개념이다. 타입스크립트가 넓은 타입으로부터 좁은 타입으로 진행하는 과정을 말한다.
일반적인 예시로는 null 체크이다.

```ts
const el = document.getElementById("foo"); // Type is HTMLElement | null
if (el) {
  el; // Type is HTMLElement
  el.innerHTML = "Party Time".blink();
} else {
  el; // Type is null
  alert("No element #foo");
}
```

el이 null이 아닌경우, 즉 **분기문을 통해** 첫 번째 블록에서 HTMLElement | null 타입에서 null을 제외하기 때문에, 더 좁은 타입이 되어
작업이 훨씬 쉬워진다.

**분기문에서 예외를 던지거나, 함수를 반환하여** 블록의 나머지 부분에서 변수의 타입을 좁힐 수도 있다.

```ts
const el = document.getElementById("foo"); // Type is HTMLElement | null
if (!el) throw new Error("Unable to find #foo");
el; // Now type is HTMLElement
el.innerHTML = "Party Time".blink();
```

또한 **instanceof를 사용해** 타입을 좁힐 수도 있다.

```ts
function contains(text: string, search: string | RegExp) {
  if (search instanceof RegExp) {
    search; // Type is RegExp
    return !!search.exec(text);
  }
  search; // Type is string
  return text.includes(search);
}
```

속성 체크로도 타입을 좁힐 수 있다.

```ts
interface A {
  a: number;
}
interface B {
  b: number;
}
function pickAB(ab: A | B) {
  if ("a" in ab) {
    ab; // Type is A
  } else {
    ab; // Type is B
  }
  ab; // Type is A | B
}
```

Array.isArray 같은 일부 내장 라이브러리를 통해 타입을 좁힐 수 있다.

```ts
function contains(text: string, terms: string | string[]) {
  const termList = Array.isArray(terms) ? terms : [terms];
  termList; // Type is string[]
  // ...
}
```

타입스크립트는 일반적으로 조건문을 통해 타입을 좁히는 데 능숙하다. 하지만, 조건문으로 처리할 때는 판단의 실수를 발생시키기 쉬우니 주의해야 한다.
null도 분명 object 이다.

💬 개인적으로도 조건문을 통해 분기처리하여 null을 처리하여 코드상에서 값의 특정 타입 영역을 만들어내곤 한다. 그렇다면, Optional chaining은 과연 어떻게 잘 처리할 수 있을 까, 혹은 Optional chaining이 가독성에 도움이 되는 구조일 까라는 생각이 든다.

```ts
const el = document.getElementById("foo"); // type is HTMLElement | null
if (typeof el === "object") {
  el; // Type is HTMLElement | null
}

function foo(x?: number | string | null) {
  if (!x) {
    x; // Type is string | number | null | undefined
  }
}
```

타입을 좁히는 또 다른 일반적인 방법은 명시적인 '태그'를 붙이는 것이다. 특정 속성을 사용하여 구분짓는 것이다.
**이러한 패턴을 '태그된', '구별된' 유니온이라고 한다.**

```ts
interface UploadEvent {
  type: "upload";
  filename: string;
  contents: string;
}
interface DownloadEvent {
  type: "download";
  filename: string;
}
type AppEvent = UploadEvent | DownloadEvent;

function handleEvent(e: AppEvent) {
  switch (e.type) {
    case "download":
      e; // Type is DownloadEvent
      break;
    case "upload":
      e; // Type is UploadEvent
      break;
  }
}
```

타입스크립트가 타입을 식별하지 못한다면, 식별을 돕기 위해 커스텀 함수를 도입할 수도 있다. **이러한 기법을 '사용자 정의 타입 가드'라고 한다.**

```ts
function isInputElement(el: HTMLElement): el is HTMLInputElement {
  return "value" in el;
}

function getElementContent(el: HTMLElement) {
  if (isInputElement(el)) {
    el; // Type is HTMLInputElement
    return el.value;
  }
  el; // Type is HTMLElement
  return el.textContent;
}
```

여기서, 반환 타입은 `el is HTMLInputElement` 이다. 이는 함수의 반환이 true인 경우, 타입 체커에게 매개변수의 타입을 좁힐 수 있다고 알려준다.

흔히, 배열을 탐색할 때 undefined가 될 수 있는 타입을 사용하게 된다. 이럴 때 타입 가드를 사용하면 타입을 좁힐 수 있다.

```ts
const jackson5 = ["Jackie", "Tito", "Jermaine", "Marlon", "Michael"];
const members = ["Janet", "Michael"]
  .map((who) => jackson5.find((n) => n === who))
  .filter((who) => who !== undefined); // Type is (string | undefined)[]

function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}
const members = ["Janet", "Michael"]
  .map((who) => jackson5.find((n) => n === who))
  .filter(isDefined); // Type is string[]
```

에디터에서 타입을 조사하는 습관을 가지면 타입 좁히기가 어떻게 동작하는 지 익힐 수 있다. 타입이 어떻게 좁혀지는 지를 이해하면 타입 추론에 대한 개념을 잡을 수 있고, 오류 발생의 원인을 알 수 있으며, 타입 체커를 더 효율적으로 이용할 수 있다.
