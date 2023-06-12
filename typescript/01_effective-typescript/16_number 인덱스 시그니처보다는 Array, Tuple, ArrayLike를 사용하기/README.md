# 아이템16. number 인덱스 시그니처보다는 Array, Tuple, ArrayLike를 사용하기

자바스크립트의 이상한 동작 방식은 유명하다. 악명 높은 암시적 타입 강제와 같은 부분을 예로 들 수 있다.
자바스크립트 객체 모델에도 이상한 부분들의 일부는 타입스크립트 타입 시스템으로 모델링되기 때문에 자바스크립트 객체 모델을 이해하는 것이 중요하다.

자바스크립트 객체란 키/값 쌍의 모음이다. 키는 보통 문자열이며, 값은 어떤 것이든 될 수 있다.

파이썬이나, 자바에서 볼 수 있는 '해시 기능' 객체라는 표현이 자바스크립트에는 없기 때문에 만약, string이 아닌 더 복잡한 객체를 키로
사용하려고 하면, toString 메서드가 호출되어 객체를 문자열로 변환되어 사용된다.

```ts
> x = {}
{}

> x[[1,2,3]]  = 2
2

> x
{'1,2,3': 1}
```

특히, 숫자는 키로 사용할 수 없기 때문에 속성 이름을 숫자로 사용하려 하면, 자바스크립트 런타임에서는 문자열로 변환하여 사용한다.

```ts
> { 1: 2, 3: 4 }
{ '1': 2, '3': 4}
```

추가적으로 배열은 객체이고, 숫자 인덱스를 사용하는 것이 당연하나 인덱스들은 모두 문자열로 변환되어 사용된다. `Object.keys`를 사용하여 배열의 키를 나열 해보면 키가 문자열로 반환된다.

```ts
> typeof []
'object'

> x = [1, 2, 3]
[1, 2, 3]

> x[0]
1

> x['1']
2

> Object.keys(x)
['0', '1', '2']
```

**타입스크립트는 이러한 혼란을 바로잡기 위해 숫자 키를 허용하고, 문자열 키와는 다른 것으로 인식한다.**
Array에 대한 타입 선언은 _lib.es5.d.ts_ 에서 확인할 수 있다.

```ts
interface Array<T> {
  // ...
  [n: number]: T;
}
```

런타임에는 ECMAScript 표준이 서술하는 것처럼 문자열 키로 인식하므로 이 코드는 완전히 가상이라 할 수 있지만,
타입 체크 시점에서 오류를 잡을 수 있어 유용하다. 이 코드는 실제로 동작하지 않으며, 타입스크립트 타입 시스템의 다른 것들과 마찬가지로
타입 정보는 런타임에 제거된다.

```ts
const xs = [1, 2, 3];
const x0 = xs[0]; // OK
const x1 = xs["1"];
// ~~~ Element implicitly has an 'any' type
//      because index expression is not of type 'number'

function get<T>(array: T[], k: string): T {
  return array[k];
  // ~ Element implicitly has an 'any' type
  //   because index expression is not of type 'number'
}
```

한편 `Object.keys` 같은 구문은 여전히 문자열로 반환된다. string이 number에 할당될 수 없기 때문에 이 코드가 동작하는 것이 이상하게 보이지만, 배열을 순회하는 코드 스타일의 실용적인 허용으로 보면 좋다.

```ts
const xs = [1, 2, 3];
const keys = Object.keys(xs); // Type is string[]
for (const key in xs) {
  key; // Type is string
  const x = xs[key]; // Type is number
}
```

하지만, `Object.keys`를 사용하여 배열을 순회하는 것은 좋은 방법은 아니다. 인덱스를 신경쓰지 않는다면, `for...of` 를 사용하면 된다.
인덱스를 신경쓴다면, `Array.prototype.forEach` 를 사용하고, 루프 중간에 탈출이 필요하다면 `for(;;)` 을 사용하면 된다.

```ts
const xs = [1, 2, 3];
for (const x of xs) {
  x; // Type is number
}
```

가령, 인덱스 시그니처가 number로 표현되어 있다면, 입력한 값이 number여야 한다는 것을 의미하지만, 실제 런타임에서는 string 타입이다.
혼란스러운 부분이지만, 일반적으로 string 대신 number를 타입의 인덱스 시그니처로 사용할 이유는 많지 않다. 만약 숫자로 인덱스할 항목을 지정한다면,
Array 대신 Tuple을 사용하는 것이 낫다.

한편, Array 타입이 사용하지도 않을 push나 concat 같은 다른 속성을 가지는 게 납득하기 어려울 수 있다. 어떤 길이를 가지는 배열과 비슷한 형태의 튜플을 사용하고 싶다면 타입스크립트에 있는 ArrayLike 타입을 사용할 수 있다. 그러나, ArrayLike를 사용하더라도 키는 여전히 문자열이라는 점을 잊지 말아야 한다.

```ts
const xs = [1, 2, 3];
function checkedAccess<T>(xs: ArrayLike<T>, i: number): T {
  if (i < xs.length) {
    return xs[i];
  }
  throw new Error(`Attempt to access ${i} which is past end of array.`);
}
```

```ts
//lib.es5.d.ts
interface ArrayLike<T> {
  readonly length: number;
  readonly [n: number]: T;
}

const xs = [1, 2, 3];
const tupleLike: ArrayLike<string> = {
  "0": "A",
  "1": "B",
  length: 2,
}; // OK
```
