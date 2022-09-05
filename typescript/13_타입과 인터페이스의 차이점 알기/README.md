# 아이템13. 타입과 인터페이스 차이점 알기

타입스크립트에서 명명된 타입을 정의하는 방법은 두 가지가 있다. (클래스 또한 사용할 수 있지만, 클래스는 값으로도 사용될 수 있는 자바스크립트 런타임 개념이다.)

```tsx
type TState = {
  name: string;
  capital: string;
};

interface IState {
  name: string;
  capital: string;
}
```

대부분의 경우는 타입을 사용해도 되고, 인터페이스를 사용해도 되지만, 그 차이를 명확하게 알고 일관성을 유지해야 한다. 먼저, **인터페이스와 타입 선언의 비슷한 점에 대해 알아본다.**

> IState와 TState를 추가 속성과 함께 할당한다면 동일한 오류가 발생한다.

---

```tsx
type TState = {
  name: string;
  capital: string;
};
interface IState {
  name: string;
  capital: string;
}
const wyoming: TState = {
  name: "Wyoming",
  capital: "Cheyenne",
  population: 500_000,
  // ~~~~~~~~~~~~~~~~~~ Type ... is not assignable to type 'TState'
  //                    Object literal may only specify known properties, and
  //                    'population' does not exist in type 'TState'
};
```

> 인덱스 시그니처는 인터페이스와 타입에서 모두 사용할 수 있다.

---

```tsx
type TDict = { [key: string]: string };
interface IDict {
  [key: string]: string;
}
```

> 함수 타입도 인터페이스나 타입 모두 정의할 수 있다.

---

```tsx
type TFn = (x: number) => string;
interface IFn {
  (x: number): string;
}

const toStrT: TFn = (x) => "" + x; // OK
const toStrI: IFn = (x) => "" + x; // OK
```

> 타입 별칭과 인터페이스는 모두 제네릭이 가능하다.

---

```tsx
type TPair<T> = {
  first: T;
  second: T;
};
interface IPair<T> {
  first: T;
  second: T;
}
```

> 인터페이스는 타입을 확장할 수 있고, 타입은 인터페이스를 확장할 수 있다.

---

하지만, 여기서 주의할 점은 인터페이스는 유니온 타입 같은 복잡한 타입을 확장하지는 못한다. 복잡한 타입을 확장하고 싶으면 타입과 &를 사용해야 한다.

```tsx
type TState = {
  name: string;
  capital: string;
};
interface IState {
  name: string;
  capital: string;
}
interface IStateWithPop extends TState {
  population: number;
}
type TStateWithPop = IState & { population: number };
```

> 클래스를 구현할 때는 타입과 인터페이스 둘 다 사용할 수 있다.

---

```tsx
class StateT implements TState {
  name: string = "";
  capital: string = "";
}
class StateI implements IState {
  name: string = "";
  capital: string = "";
}
```

지금까지 타입과 인터페이스의 비슷한 점들을 살펴봤다. **이제 다른 점을 알아본다.**

> 유니온 타입은 있지만, 유니온 인터페이스라는 개념은 없다.

---

```tsx
type AorB = "a" | "b";
```

인터페이스는 타입을 확장할 수 있지만, 유니온은 할 수 없다. 그런데 유니온 타입을 확장하는 게 필요할 때가 있다.

Input과 Output은 별도의 타입이며, 이 둘을 하나의 변수명으로 매핑하는 VariableMap 인터페이스를 만들 수 있고, 유니온 타입에 name 속성을 붙인 타입을 만들 수도 있다.

이러한 형태의 타입은 인터페이스로 표현할 수 없다. type 키워드는 일반적으로 interface보다 쓰임새가 많다.

```tsx
type Input = {
  /* ... */
};
type Output = {
  /* ... */
};
interface VariableMap {
  [name: string]: Input | Output;
}

type NamedVariable = (Input | Output) & { name: string };
```

> 튜플과 배열 타입도 type 키워드를 통해 더 간결하게 표현할 수 있다.

---

```tsx
type Pair = [number, number];
type StringList = string[];
type NamedNums = [string, ...number[]];
```

인터페이스로도 구현이 가능하다. 그러나, 튜플에서 사용할 수 있는 concat과 같은 메서드를 사용할 수 없게 된다. 즉, 튜플은 type 키워드로 구현하는 것이 낫다.

```tsx
interface Tuple {
  0: number;
  1: number;
  length: 2;
}
const t: Tuple = [10, 20]; // OK
```

> 반면, 인터페이스는 타입에 없는 몇 가지 기능이 있다. 그 중 하나는 ‘보강(argument)’이 가능하다.

---

아래와 같이 속성을 확장하는 것을 ‘선언 병합’ 이라 한다.

```tsx
interface IState {
  name: string;
  capital: string;
}
interface IState {
  population: number;
}
const wyoming: IState = {
  name: "Wyoming",
  capital: "Cheyenne",
  population: 500_000,
}; // OK
```

선언 병합은 주로 타입 선언 파일에서 사용되는데, 타입 선언 파일을 작성할 때는 선언 병합을 지원하기 위해 반드시 인터페이스를 사용해야 하며 표준을 따라야 한다. 타입스크립트는 여러 버전의 자바스크립트 표준 라이브러리에서 여러 타입을 모아 병합한다.

예를 들어, Array 인터페이스는 *lib.es5.d.ts*에 정의되어 있다. 그러나, _tsconfig.json lib_ 목록에 ES2015를 추가하면 타입스크립트는 *lib.es2015.d.ts*에 선언된 인터페이스를 병합한다. 이들은 병합을 통해 다른 Array 인터페이스에 추가된다. 즉, 결과적으로 각 선언이 병합되어 전체 메서드를 가지는 하나의 Array 타입을 얻게 된다.

병합은 선언과 마찬가지로 일반적인 코드에서도 지원되므로 언제 병합이 가능한지 알고 있어야 한다. 타입은 기존 타입에 추가적인 보강이 없는 경우에만 사용해야 한다.

결론적으로, 어떤 것을 사용해야 할 까? 복잡한 타입이라면 고민할 것도 없이 타입 별칭을 사용한다. 그러나, 타입과 인터페이스, 두 가지 방법으로 모두 표현할 수 있는 간단한 객체 타입이라면 일관성과 보강의 관점에서 고려해 봐야 한다. 합류하게 된 프로젝트의 코드베이스에 따라 일관된 타입 혹은 인터페이스 사용을 선택할 수 있다. 하지만, 아직 확립되지 않은 프로젝트의 코드베이스라면, 향후 보강의 가능성이 있다면 가령, 어떤 API에 대한 타입 선언을 작성해야 한다면 인터페이스를 사용하여 추후 보강이 가능하도록 한다. 그러나, 프로젝트 내부적으로 사용되는 타입에 선언 병합이 발생하는 것은 잘못된 설계이다. 따라서 이럴 때는 타입을 사용해야 한다.
