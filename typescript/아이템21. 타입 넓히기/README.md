# 아이템21. 타입 넓히기

런타임에서는 모든 변수는 유일한 값을 가진다. 그러나, 타입스크립트가 작성된 코드를 체크하는 정적 분석 지점에서
변수는 '기능한' 값들의 집합인 타입을 가진다. 상수 초기화 시, 타입을 명시하지 않으면 타입체커가 타입을 결정해야 하는데
할당된 값을 통해 할당 가능한 값들의 집합을 유추해야 한다는 뜻이다. 타입스크립트에서 이 과정을 '타입 넓히기' 라고 부른다.

타입 넓히기가 진행될 때, 주어진 값으로 추론 가능한 타입이 여러 개가 된다면 그 과정이 상당히 모호해지기 때문에 아래와 같은 오류가 발생한다.

```ts
interface Vector3 {
  x: number;
  y: number;
  z: number;
}
function getComponent(vector: Vector3, axis: "x" | "y" | "z") {
  return vector[axis];
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}
function getComponent(vector: Vector3, axis: "x" | "y" | "z") {
  return vector[axis];
}
let x = "x";
let vec = { x: 10, y: 20, z: 30 };
getComponent(vec, x);
// ~ Argument of type 'string' is not assignable to
//   parameter of type '"x" | "y" | "z"'
```

mixed의 타입이 추론될 때 그 후보군이 다양하다. **타입스크립트는 명확성과 유연성 사이의 균형을 유지하며 작성자의 의도를 추측한다.**

```ts
const mixed = ["x", 1];
```

- ('x', 1)[]
- ['x', 1]
- [string, number]
- readonly [string, number]
- (string|number)[]
- readonly (string|number)[]
- [any, any]
- any[]

타입스크립트는 넓히기 과정을 제어할 수 있는 몇 가지 방법을 제공한다. 첫 번째 방법은 const를 사용하는 것이다.
let 보다 const로 변수를 선언하면 더 좁은 타입이 된다. 아래의 코드에서 x는 더 이상 재할당될 수 없기 때문에 타입은 string 보다
더 좁은 타입인 "x"가 된다.

```ts
interface Vector3 {
  x: number;
  y: number;
  z: number;
}
function getComponent(vector: Vector3, axis: "x" | "y" | "z") {
  return vector[axis];
}
const x = "x"; // type is "x"
let vec = { x: 10, y: 20, z: 30 };
getComponent(vec, x); // OK
```

그러나, mixed 예제와 같이 배열에 대한 문제가 여전히 남아있다. 튜플 타입을 추론해야 할 지, 요소들은 어떤 타입으로 추론해야 할지 알 수 없다.
비슷한 예로 객체가 있다.

```ts
const v = {
  x: 1,
};
v.x = 3; // OK
v.x = "3";
// ~ Type '"3"' is not assignable to type 'number'
v.y = 4;
// ~ Property 'y' does not exist on type '{ x: number; }'
v.name = "Pythagoras";
// ~~~~ Property 'name' does not exist on type '{ x: number; }'
```

v 타입은 구체적인 정도에 따라 다양한 모습으로 추론될 수 있다. **객체의 경우 타입스크립트의 넓히기 알고리즘은 각 요소를 let으로 할당된 것처럼 다룬다.** 그래서, v의 타입은 {x: number}가 된다. 그리고, 다른 속성을 추가할 수 없다. **오류를 잡기 위해서는 충분히 구체적으로 타입을 추론해야 하지만, 명확성과 유연성을 유지하기 위해 잘못된 추론을 할 정도로 구체적으로 수행하지는 않는다.**

타입 추론의 강도를 직접 제어하려면, 타입스크립트의 기본 동작을 재정의해야 한다.

- 명시적 타입 구문을 제공한다.

```ts
const v: { x: 1 | 3 | 5 } = {
  x: 1,
};
```

- 타입 체커에 추가적인 문맥을 제공한다. 가령, 함수의 매개변수로 값을 전달한다.
- const 단언문을 사용한다.

**const 단언문과 변수 선언에 쓰이는 let, const와 혼동되어서는 안된다. const 단언문은 완전히 타입 공간의 기법이다.**
값 뒤에 as const를 붙이면 타입스크립트는 최대한 좁은 타입으로 추론한다. v3에는 넓히기가 동작하지 않는다.
정말 v3가 상수라면, 주석에 보이는 추론된 타입이 실제로 원하는 형태일 것이다.

```ts
const v1 = {
  x: 1,
  y: 2,
}; // Type is { x: number; y: number; }

const v2 = {
  x: 1 as const,
  y: 2,
}; // Type is { x: 1; y: number; }

const v3 = {
  x: 1,
  y: 2,
} as const; // Type is { readonly x: 1; readonly y: 2; }
```

```ts
const a1 = [1, 2, 3]; // Type is number[]
const a2 = [1, 2, 3] as const; // Type is readonly [1, 2, 3]
```
