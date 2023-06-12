## Conditional Type

## extends

### 1. 제약조건으로 사용되는 extends

타입스크립트에서 제공하는 내장 제너릭 `Pick`은 다음과 같이 구현할 수 있고 사용된다.

```ts
type MyPick<T, U extends keyof T> = {
  [key in U]: any;
} 

type Person = {
  name: string;
  age: number;
  address: string;
}

type PrivatePerson = MyPick<Person, 'name'>;
```

여기서, `extends`가 사용된 타입 정의는 어떻게 해석할 수 있을까, 종종 머리 아파지는 구문이다.

```ts
T extends U
```

타입 시스템을 집합으로 표현했을때, 'T는 U보다 작다.' 혹은 'T는 U의 부분집합이다.'로 해석할 수 있다.
즉, T의 범위를 U로 제한하는 제약 조건을 둔 셈이다.

```ts
U extends keyof T
```

다시 `Pick`에서 사용된 `extends`의 구문을 보면, 'U는 T 인터페이스의 키 집합으로 제한한다.' 혹은
'U는 T 인터페이스 키의 부분 집합이다.' 로 해석할 수 있다.

### 2. 조건부로 사용되는 extends

타입시스템에서 입력의 타입을 기반으로 출력의 타입을 결정할 수 있도록 타입 간의 관계를 열어두었다. 이때 `extends`
를 조건부로 사용할 수 있는데, 해석은 제약 조건과 같지만, 마치 'T는 U의 부분집합인가?'를 묻는 의문문으로 사용된다.

```ts
false extends boolean
'false' extends boolean
```

false는 boolean의 부분 집합인가?, 'false'는 boolean의 부분 집합인가? 답은 각각 true, false를 얻어낼 수 있다. 
조건에서 얻어진 참, 거짓의 결과를 삼항 연산자와 함께 조건부로서 출력 타입을 결정할 수 있다.

T에서 U에 할당할 수 있는 타입을 제외하는 내장 제네릭 Exclude<T, U>를 예시로 들어보자. 
유니온된 타입 중 하나인 'number는 number의 부분집합인가?' 에 참이기 때문에 never을 반환한다.

```ts
type MyExclude<T, U> = T extends U ? never : T;
type StringOnly = MyExclude<number | string, number> // expected to be 'string'
```

## infer

infer은 extends의 조건식에서 사용되는 타입을 꺼내 담고, 참으로 평가될때 전개되는 구문에서 사용할 수 있다. 
타입스크립트 엔진이 런타임 상황에서 타입을 추론할 수 있도록 열어두고, 조건이 참이면 infer U 구문의 U 타입을 할당, 거짓이면 never를 할당하여 무시한다.

T에 할당된 타입이 함수일때, 해당 함수의 파라미터를 튜플 타입으로 반환하는 내장 제네릭 Parameters<T>를 예시로 들어보자. 
Parameters의 T로서 가능한 타입을 함수로 제한하고, 제한된 함수 타입에 부합하는지에 대한 참 조건에서 U로 명명된 타입을 사용한다.

```ts
type MyParameters<T extends (...args: any[]) => any> = T extends (
  ...args: infer U
) => any
  ? [...U]
  : any;
  
  
type T0 = MyParameters<() => string>; //type is []
type T1 = MyParameters<(s: string) => void>; //type is [s: string]
type T4 = MyParameters<any>; //type is any
```

이해를 돕기 위해 또 다른 예시를 살펴보자. 가령 Promise와 같이 래핑하는 타입 내부의 타입을 구하고 싶다면 어떻게 할 수 있을까? 
재귀적으로 Promise 타입을 벗겨내서 내부 타입을 추론할 수 있다.

```ts
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

type X = Promise<string>;
type Y = Promise<{ field: number }>;
type Z = Promise<Promise<string | number>>;

type AwaitedX = MyAwaited<X>; //expected to be 'string'
type AwaitedY = MyAwaited<Y>; //expected to be '{ field: number }'
type AwaitedZ = MyAwaited<Z>; //expected to be 'string | number'
```

