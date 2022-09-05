# 아이템26. 타입 추론에 문맥이 어떻게 사용되는 지 이해하기

타입스크립트는 타입을 추론할 때 단순히 값만 고려하지 않고, 값이 존재하는 곳의 문맥까지 살핀다.
문맥을 고려해 타입을 추론하면 가끔 이상한 결과가 나오는데, 타입 추론에 문맥이 어떻게 사용되는 지 이해하고 있다면
제대로 대처할 수 있다.

자바스크립트는 코드의 동작과 실행 순서를 바꾸지 않으면서 표현식을 상수로 분리해 낼 수 있다.

```js
function setLanguage(language: string) {
  /* ... */
}

setLanguage("JavaScript"); // OK

let language = "JavaScript";
setLanguage(language); // OK
```

타입스크립트에서 또한 동작합니다.

```ts
function setLanguage(language: string) {
  /* ... */
}
setLanguage("JavaScript"); // OK

let language = "JavaScript";
setLanguage(language);
```

여기서, setLanguage 파라미터의 language 타입을 더 특정지어 문자열 리터럴 타입의 유니온으로 바꾼다고
가정해보면 해당 타입에 문자열 리터럴 'Javascript'는 할당 가능하므로 정상이지만, 이 값을 변수로 분리해내면
타입스크립트는 할당 시점에 타입을 추론한다. 즉, 변수 language는 string으로 추론되었기 때문에 Language 타입에
할당이 불가능한 오류가 발생한다.

```ts
type Language = "JavaScript" | "TypeScript" | "Python";
function setLanguage(language: Language) {
  /* ... */
}

setLanguage("JavaScript"); // OK

let language = "JavaScript";
setLanguage(language);
a;
// ~~~~~~~~ Argument of type 'string' is not assignable
//          to parameter of type 'Language'
```

이러한 문제는 두 가지 방법으로 해결 가능하다. 첫 번째는 타입 선언에서 language의 가능한 값을 제한한다.

```ts
let language: Language = "JavaScript";
setLanguage(language); // OK
```

두 번째 방법은 language를 상수(const)로 선언하는 것이다. const를 사용하여 타입 체커에게 language값은 더 이상 변경될 수 없음을 알려주면, 타입스크립트는 language에 대해서 더 정확한 타입인 문자열 리터럴 "JavaScript"로 추론할 수 있다.

```ts
const language = "JavaScript";
setLanguage(language); // OK
```

물론, language를 재할당해야 한다면 타입 선언이 필요하다. 그런데 이 과정에서 사용되는 문맥으로부터 값을 분리했다. 문맥과 값을 분리하면 추후에 근본적인 문제를 발생시킬 수 있다.

이러한 문맥의 소실로 인해 오류가 발생하는 몇 가지 경우와 어떻게 해결해야 하는 지 살펴보자.

**튜플 사용 시 주의점**

문자열 리터럴 타입과 마찬가지로, 튜플 타입에서도 문제가 발생한다. 아래와 같이 이동이 가능한 지도를 보여주는 프로그램을 만든다고 했을 때, 문자 리터럴 타입과 마찬가지로 문맥과 값을 분리했다. 첫 번째 경우는 [10, 20]의 타입을 튜플 타입 [number, number]에 할당가능하다. 하지만, 두 번째 경우는 타입스크립트가 loc 타입을 number[]로 추론한다.

```ts
type Language = "JavaScript" | "TypeScript" | "Python";
function setLanguage(language: Language) {
  /* ... */
}
// Parameter is a (latitude, longitude) pair.
function panTo(where: [number, number]) {
  /* ... */
}

panTo([10, 20]); // OK

const loc = [10, 20];
panTo(loc);
//    ~~~ Argument of type 'number[]' is not assignable to
//        parameter of type '[number, number]'
```

이는, 타입스크립트가 의도를 정확히 파악할 수 있도록 타입 선언을 제공하는 방법을 시도할 수 있다.

```ts
const loc: [number, number] = [10, 20];
panTo(loc);
```

또 다른 방법은 '상수 문맥'을 제공하는 것이다. **const는 단지 값이 가리키는 참조가 변하지 않는 얕은(shallow) 상수인 반면, as const는 그 값이 내부(deeply)까지 상수라는 사실을 타입스크립트에게 알려준다.**

```ts
const loc = [10, 20] as const;
panTo(loc);
// ~~~ Type 'readonly [10, 20]' is 'readonly'
//     and cannot be assigned to the mutable type '[number, number]'
```

하지만, loc은 이제 number[]가 아니라, readonly [10, 20]으로 추론된다. 이 추론은 안타깝게도 '너무 과하게' 정확하다.
panTo의 타입 시그니처는 where의 내용이 불변이라고 보장하지 않는다.

따라서 오류를 고칠 수 있는 최선의 해결책은 panTo 함수에 readonly를 추가하는 것이다.

```ts
function panTo(where: readonly [number, number]) {
  /* ... */
}
const loc = [10, 20] as const;
panTo(loc); // OK
```

**객체 사용 시 주의점**

문맥에서 값을 분리하는 문제는 문자열 리터럴이나, 튜플을 포함하는 큰 객체에서 상수를 뽑아낼 때도 문제가 발생한다.
ts객체에서 language의 타입은 string으로 추론된다. 이 문제는 타입 선언을 추가하거나, 상수 단언을 통해 해결 가능하다.

```ts
type Language = "JavaScript" | "TypeScript" | "Python";
interface GovernedLanguage {
  language: Language;
  organization: string;
}

function complain(language: GovernedLanguage) {
  /* ... */
}

complain({ language: "TypeScript", organization: "Microsoft" }); // OK

const ts = {
  language: "TypeScript",
  organization: "Microsoft",
};
complain(ts);
//       ~~ Argument of type '{ language: string; organization: string; }'
//            is not assignable to parameter of type 'GovernedLanguage'
//          Types of property 'language' are incompatible
//            Type 'string' is not assignable to type 'Language'
```

**콜백 사용 시 주의점**

**콜백을 다른 함수로 전달할 때, 타입스크립트는 콜백의 매개변수 타입을 추론하기 위해 문맥을 사용한다.**

```ts
function callWithRandomNumbers(fn: (n1: number, n2: number) => void) {
  fn(Math.random(), Math.random());
}

callWithRandomNumbers((a, b) => {
  a; // Type is number
  b; // Type is number
  console.log(a + b);
});
```

callWithRandomNumbers의 타입 선언으로 인해 a, b의 타입이 number로 추론된다.
하지만, 콜백을 상수로 뽑아내면 문맥이 소실되고, noImplicitAny 오류가 발생하게 된다.

```ts
const fn = (a, b) => {
  // ~    Parameter 'a' implicitly has an 'any' type
  //    ~ Parameter 'b' implicitly has an 'any' type
  console.log(a + b);
};
callWithRandomNumbers(fn);
```

이러한 경우, 매개변수에 타입 구문을 추가해서 해결할 수 있고, 가능할 경우 전체 함수 표현식에 타입 선언을 적용할 수 있다.

```ts
const fn = (a: number, b: number) => {
  console.log(a + b);
};
callWithRandomNumbers(fn);
```
