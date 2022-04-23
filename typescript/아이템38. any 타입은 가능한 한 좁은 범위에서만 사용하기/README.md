# 아이템38. any 타입은 가능한 한 좁은 범위에서만 사용하기

전통적으로, 프로그래밍 언어들의 타입 시스템은 완전히 정적이거나, 완전히 동적이지만
타입스크립트의 타입 시스템은 선택적이고, 점진적이기 때문에 정적이면서도 동적인 특성을 동시에 가진다.
따라서, 타입스크립트는 프로그램의 일부분에만 타입 시스템을 적용할 수 있으며, 이를 통해 점진적인 마이그레이션이 가능하다.

여기서, any 타입이 중요한 역할을 한다. 또한, any 타입을 현명하게 사용하는 방법을 익혀야만 효과적인 타입스크립트
코드를 작성할 수 있다. any가 매우 강력한 힘을 가지므로 남용할 여지가 충분하기 때문이다.

먼저, 함수와 관련된 any의 사용법을 살펴보자.

```ts
interface Foo {
  foo: string;
}
interface Bar {
  bar: string;
}
declare function expressionReturningFoo(): Foo;

function processBar(b: Bar) {
  /* ... */
}

function f() {
  const x = expressionReturningFoo();
  processBar(x);
  //         ~ Argument of type 'Foo' is not assignable to
  //           parameter of type 'Bar'
}
```

문맥상으로 x라는 변수가 동시에 Foo, Bar 타입에 할당가능하다면, 오류를 제거하는 방법은 크게 두 가지가 있다.

```ts
function processBar(b: Bar) {
  /* ... */
}
function f1() {
  const x: any = expressionReturningFoo(); // Don't do this
  processBar(x);
}

function f2() {
  const x = expressionReturningFoo();
  processBar(x as any); // Prefer this
}
```

여기서, f1에 사용된 `x: any`보다 f2에서 사용된 `x as any` 형태가 권장된다.
any 타입이 processBar 함수의 매개변수에서만 사용된 표현식이므로, 다른 코드에는 영향을 주지 않기 때문이다.
결론적으로, f1에서는 함수의 마지막까지 x의 타입이 any인 반면, f2에서는 processBar 호출 이후에 x가 그대로 Foo 타입이다.

만약, f1 함수가 x를 반환한다면 문제가 커지는데, g 함수 내에서 f1이 사용되므로 f1의 반환 타입인 any 타입이 foo의 타입에
영향을 미치게 되고, 이러한 영향력은 프로젝트 전반적으로 퍼지게 된다. 반면, any의 사용 범위를 좁게 제한하는 f2 함수를 사용한다면
any 타입이 함수 바깥으로 영향을 끼치지 않게 된다.

```ts
function f1() {
  const x: any = expressionReturningFoo();
  processBar(x);
  return x;
}

function g() {
  const foo = f1(); // Type is any
  foo.fooMethod(); // This call is unchecked!
}
```

비슷한 관점에서 타입스크립트가 함수의 반환 타입을 추론할 수 있는 경우에도 함수의 반환 타입을 명시하는 것이 좋다.
**함수의 반환 타입을 명시하면 any 타입이 함수 바깥으로 영향을 미치는 것을 방지할 수 있다.**

f1, f2 함수를 다시 살펴보면, f1은 오류를 제거하기 위해 x를 any 타입으로 선언하였고, f2는 오류를 제거하기 위해 x가 사용되는 곳에서
`as any` 단언문을 사용했다. 여기서 @ts-ignore 를 사용하면 any를 사용하지 않고 오류를 제거할 수 있다.

```ts
function f1() {
  const x = expressionReturningFoo();
  // @ts-ignore
  processBar(x);
  return x;
}
```

그러나, 근본적인 원인을 해결한 것이 아니기 때문에 다른 곳에서 더 큰 문제가 발생할 수 있다. 타입 체커가 알려 주는 오류는 대부분
문제가 될 가능성이 높은 부분이므로, 근본적인 원인을 찾아 적극적으로 대처하는 것이 바람직하다.

이번에는 객체와 관련된 any의 사용법을 살펴보자. 어떤 큰 객체 안의 한 개 속성이 타입 오류를 가지는 상황을 예로 들어보자.

```ts
interface Config {
  a: number;
  b: number;
  c: {
    key: Foo;
  };
}

declare const value: Bar;
const config: Config = {
  a: 1,
  b: 2,
  c: {
    key: value
 // ~~~ Property ... missing in type 'Bar' but required in type 'Foo'
```

이럴때는 단순히 config 객체 전체를 `as any`를 통해 오류를 제거하는 것이 아니라, 다음 코드처럼 최소한의 범위에만
any를 사용하는 것이 좋다.

```ts
const config: Config = {
  a: 1,
  b: 2,
  c: {
    key: value,
  },
} as any; // Don't do this!

const config: Config = {
  a: 1,
  b: 2, // These properties are still checked
  c: {
    key: value as any,
  },
};
```

결론적으로, 의도치 않은 타입 안정성의 손실을 피하기 위해서 any의 사용 범위를 최소한으로 좁여야 하며,
함수의 반환 타입이 any인 경우 타입 안정성이 나빠지기 때문에 반환 타입 명시를 통해 any 타입이 반환되지 않게 방지해야 한다.
