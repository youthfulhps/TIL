# 아이템34. 부정확한 타입보다는 미완성 타입을 사용하기

코드의 동작을 모델링하기 위해 타입 선언을 작성하다보면, 더 구체적으로 혹은 덜 구제적으로 모델링하게 되는 상황을 맞닥뜨리게 된다.
일반적으로 타입은 구체적일 수록 버그를 더 많이 잡고 타입스크립트가 제공하는 도구를 활용할 수 있다.

하지만, 타입선언의 정밀도를 높이는 일은 실수가 발생할 여지가 있다. 잘못된 타입은 차라리 타입이 없는 것보다 못할 수 있다.

GeoJSON 형식의 타입 선언을 작성한다고 가정해보자. GeoJSON 정보는 각각 다른 형태의 좌표 배열을 가지는 몇 가지 타입 중 하나가 될 수 있다.

```ts
interface Point {
  type: "Point";
  coordinates: number[];
}
interface LineString {
  type: "LineString";
  coordinates: number[][];
}
interface Polygon {
  type: "Polygon";
  coordinates: number[][][];
}
type Geometry = Point | LineString | Polygon; // Also several others
```

여기서 좌표에 쓰이는 `number[]`가 약간 추상적이다. 여기서 `number[]`는 경도와 위도를 나타내므로 차라리 튜플로 선언하는 것이 낫다.

```ts
type GeoPosition = [number, number];
interface Point {
  type: "Point";
  coordinates: GeoPosition;
}
// Etc.
```

하지만, 좌표를 나타내는 위도, 경도만 명시했지만, 그 위의 위치 정보들이 존재할 수 있다. 결과적으로 타입 선언을 세밀하게 만들고자 했지만, 시도가 너무 과했고 오히려 타입이 부정확해졌다.

이번엔, JSON으로 정의된 Lisp와 비슷한 언어의 타입 선언을 작성한다고 가정해보자. 이 때 입력값으로 들어올 수 있는 종류는 '모두 허용', '문자열, 숫자, 배열 허용', '문자열, 숫자, 알려진 함수 이름으로 시작하는 배열 허용', '각 함수가 받는 매개변수의 개수가 정확한지 확인', '각 함수가 받는 매개변수의 타입이 정확한지 확인' 해야 한다.

처음 두 옵션을 타입 선언으로 모델링하는 것은 쉽다.

```ts
type Expression1 = any;
type Expression2 = number | string | any[];
```

이를 테스트 케이스에 적용해보자. 타입을 구체적으로 만들수록 정밀도가 손상되는 것을 방지하는 데 도움이 된다.

```ts
const tests: Expression2[] = [
  10,
  "red",
  true,
  // ~~~ Type 'true' is not assignable to type 'Expression2'
  ["+", 10, 5],
  ["case", [">", 20, 10], "red", "blue", "green"], // Too many values
  ["**", 2, 31], // Should be an error: no "**" function
  ["rgb", 255, 128, 64],
  ["rgb", 255, 0, 127, 0], // Too many values
];
```

정밀도를 올리기 위해서 튜플의 첫 번째 요소에 문자열 리터럴 타입의 유니온을 사용해보자.

```ts
type Expression1 = any;
type Expression2 = number | string | any[];
type FnName = "+" | "-" | "*" | "/" | ">" | "<" | "case" | "rgb";
type CallExpression = [FnName, ...any[]];
type Expression3 = number | string | CallExpression;

const tests: Expression3[] = [
  10,
  "red",
  true,
  // ~~~ Type 'true' is not assignable to type 'Expression3'
  ["+", 10, 5],
  ["case", [">", 20, 10], "red", "blue", "green"],
  ["**", 2, 31],
  // ~~~~~~~~~~~ Type '"**"' is not assignable to type 'FnName'
  ["rgb", 255, 128, 64],
];
```

정밀도를 유지하면서 오류를 하나 더 잡았다. 이제 매개변수의 개수가 정확한지 확인해보자. 타입스크립트에서는 함수의 매개변수 개수를 파악하기 위해 최소한 하나의 인터페이스를 추가해야 한다. 여러 인터페이스를 호출 표현식으로 묶을 수 없기 때문에 각 인터페이스를 나열해서 호출 표현식을 작성한다. 고정 길이 배열은 튜플 타입으로 간단히 표현할 수 있기 때문에 어색해 보일 수는 있지만, 다음 코드처럼 구현할 수 있다.

```ts
type Expression1 = any;
type Expression2 = number | string | any[];
type Expression4 = number | string | CallExpression;

type CallExpression = MathCall | CaseCall | RGBCall;

interface MathCall {
  0: "+" | "-" | "/" | "*" | ">" | "<";
  1: Expression4;
  2: Expression4;
  length: 3;
}

interface CaseCall {
  0: "case";
  1: Expression4;
  2: Expression4;
  3: Expression4;
  length: 4 | 6 | 8 | 10 | 12 | 14 | 16; // etc.
}

interface RGBCall {
  0: "rgb";
  1: Expression4;
  2: Expression4;
  3: Expression4;
  length: 4;
}

const tests: Expression4[] = [
  10,
  "red",
  true,
  // ~~~ Type 'true' is not assignable to type 'Expression4'
  ["+", 10, 5],
  ["case", [">", 20, 10], "red", "blue", "green"],
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //  Type '["case", [">", ...], ...]' is not assignable to type 'string'
  ["**", 2, 31],
  // ~~~~~~~~~~~~ Type '["**", number, number]' is not assignable to type 'string
  ["rgb", 255, 128, 64],
  ["rgb", 255, 128, 64, 73],
  // ~~~~~~~~~~~~~~~~~~~~~~~~ Type '["rgb", number, number, number, number]'
  //                          is not assignable to type 'string'
];
```

이제 무효한 표현식에서 전부 오류가 발생한다. 타입 정보가 더 정밀해졌지만, 결과적으로 이전 버전보다 개선되었다고 보기는 어렵다. 잘못 사용된 코드에서 오류가 발생하기는 하지만 오류 메세지는 더 난해해졌다.

추가적으로 타입 선언의 복잡성으로 인해 버그가 발생할 가능성도 높아졌다. 코드를 더 정밀하게 만들려던 시도가 너무 과했고, 그로 인해 코드가 오히려 더 부정확해졌다. 이렇게 부정확함을 바로잡는 방법을 쓰는 대신, 차라리 테스트 세트를 추가하여 놓친 부분이 없는지 확인해도 된다.
타입이 구체적으로 정제된다고 해서 정확도가 무조건 올라가지는 않는다. 타입에 의존하기 시작하면 부정확함으로 인해 발생하는 문제가 더 커질 것이다.
