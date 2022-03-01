> 타입스크립트에서 변수에 값을 할당하고 타입을 부여하는 방법은 두 가지이다.

---

💬 아래와 같은 두 가지 방법의 결과가 같아 보이지만, 그렇지 않습니다. 첫 번째 `alice: Person` 은 변수에 '타입 선언' 하여 그 값이 선언된 타입임을 명시합니다. 두 번째, `as Person` 은 '타입 단언' 하여 타입스크립트가 추론한 타입이 있다 하더라도 Person 타입으로 간주됩니다.

```tsx
interface Person {
  name: string;
}

const alice: Person = { name: "Alice" };
const bob = { name: "Bob" } as Person;
```

> 타입 단언보다 타입 선언을 사용하는 것이 낫다.

---

💬 타입 선언은 할당되는 값이 해당 인터페이스를 만족하는지 검사합니다. 그러나, 타입 단언은 타입을 강제로 단언했으니 타입체커에게 오류를 무시하라는 것과 같습니다.

```tsx
const alice: Person = {
  name: "Alice",
  occupation: "Typescript developer", //'Person' 형식에 'occupation'이 없습니다.
};

const bob = {
  name: "Bob",
  occupation: "Javascript developer",
} as Person; //오류 없음
```

> 화살표 함수의 타입 선언은 추론된 타입이 모호할 때가 있다.

---

💬 화살표 함수에서 타입 단언을 사용하면 문제가 해결되는 것처럼 보이지만, 런타임에 문제가 발생하게 됩니다.

```tsx
const people = ["alice", "bob", "jan"].map((name) => ({ name }));
//Person[]을 원했지만 결과는 {name: string;}[]...

const people = ["alice", "bob", "jan"].map((name) => ({ name } as Person));
//타입은 Person[]

const people = ["alice", "bob", "jan"].map((name) => ({} as person));
//타입은 Person[]
```

💬 단언문을 쓰지 않고 다음과 같이 변수를 선언하는 것이 가장 직관적입니다.

```tsx
const people = ["alice", "bob", "jan"].map((name): Person => ({ name }));
//타입은 Person[]
```

> 타입 단언은 타입 체커가 추론한 타입보다 개발자가 판단하는 타입이 더 정확할 때 의미가 있다.

---

💬 DOM 엘리먼트에 대해서는 타입스크립트보다 개발자가 더 정확히 알고 있을 겁니다. 타입스크립트는 DOM에 접근할 수 없기 때문에 `#myButton` 이 버튼 엘리먼트인지 알지 못합니다. 또한, 이벤트의 currentTarget이 같은 버튼이어야 하는 것도 알지 못합니다. 이 경우, 타입 단언을 사용하는 것이 마땅합니다.

```tsx
document.querySelector("#myButton").addEventListener("click", (e) => {
  e.currentTarget; //타입은 EventTarget;
  const button = e.currentTarget as HTMLButtonElement;
  button; //타입은 HTMLButtonElement;
});
```
