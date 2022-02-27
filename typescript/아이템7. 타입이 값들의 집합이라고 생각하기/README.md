# 아이템 7. 타입이 값들의 집합이라고 생각하기

> 타입은 '할당 가능한 값들의 집합' 이다.

---

💬 런타임에 모든 변수는 자바스크립트 세상의 값으로부터 정해지는 각자의 고유한 값을 가집니다. 그러나, 코드가 실행되기 전, 즉 타입스크립트가 오류를 체크하는 순간에는 '타입'을 가지고 있습니다. 그러므로 타입은 '할당 가능한 값들의 집합' 이라고 생각하면 됩니다.

💬 예를 들어, 모든 숫자값의 집합을 `number` 타입이라고 생각할 수 있습니다. 42와 37.25는 number 타입에 할당 가능한 값입니다.

💬 가장 작은 집합은 공집합이며, 타입스크립트에서는 `never` 타입입니다. 그 다음으로 작은 집합은 한 가지 값만 포함하는 타입입니다. 타입스크립트에서는 `unit` 타입 혹은 `리터럴(literal)` 타입입니다.

```tsx
type A = "A";
type B = "B";
type Twelve = 12;
```

💬 두 개 혹은 세 개로 묶으려면 `유니온(union)` 타입을 사용합니다.

```tsx
type AB = "A" | "B";
type AB12 = "A" | "B" | 12;
```

💬 집합의 관점에서, 타입 체커의 주요 역할은 하나의 집합이 다른 집합의 부분 집합인지 검사하는 것이라고 볼 수 있습니다. 다양한 타입스크립트 오류에서 '할당가능한'이라는 문구를 볼 수 있습니다. 이 문구는 집합의 관점에서 '~의 원소' 또는 '~의 부분 집합'을 의미합니다.

```tsx
const a: AB = "A"; //정상, 'A'는 집합 {'A', 'B'}의 원소입니다.
const c: AB = "C"; //~ '"C"' 형식은 'AB' 형식에 할당할 수 없습니다.
```

> 집합의 범위가 한정되어 있지 않고 대부분 범위가 무한대이다.

---

💬 범위가 무한대인 타입은 원소들을 일일히 추가해서 만든걸로 생각할 수 있습니다.

```tsx
type Int = 1 | 2 | 3 | 4 | 5 | ...
```

💬 또는, 구조적 타이핑 규칙들은 어떠한 값이 다른 속성도 가질 수 있음을 의미합니다. 어떤 객체가 `string`으로 할당 가능한 `id` 속성을 가지고 있다면 그 객체는 `Identified`입니다. 즉, `Identified` 의 범위 또한 무한대입니다.

```tsx
interface identified {
  id: string;
}
```

💬 값의 집합을 타입이라고 생각했을 때, & 연산자는 두 타입의 `인터섹션(intersection, 교집합)`을 계산합니다. 언뜻 보기에 `Person`과 `Lifespan` 인터페이스는 공통으로 가지는 속성이 없기 때문에 `PersonSpan` 은 `never` 타입으로 예상하기 쉽습니다.

💬 그러나, 타입 연산자는 인터페이스의 속성이 아닌, 값의 집합에 적용됩니다. 즉, **추가적인 속성을 가지는 값도 여전히 그 타입에 속합니다.** 그래서, `Person`과 `Lifespan`을 둘 다 가지는 값은 인터섹션 타입에 속하게 됩니다.

```tsx
interface Person {
  name: string;
}

interface Lifespan {
  birth: Date;
  death: Date;
}

type PersonSpan = Person & Lifespan;

const ps: PersonSpan = {
  name: "Alan Turing",
  birth: new Date("1912/06/23"),
  death: new Date("1954/06/07"),
}; //정상
```

💬 규칙이 속성에 대한 인터섹션에 관해서는 맞지만, 두 인터페이스의 유니온에서는 그렇지 않습니다. 아래의 유니온 타입에 속하는 값은 어떠한 키도 없기 때문에 유니온에 대한 `keyof`는 공집합이어야 합니다.

```tsx
type K = keyof (Person | Liftspan); //타입이 never
```

💬 아래의 등식은 타입스크립트의 타입 시스템을 이해하는 데 큰 도움이 될 것 입니다.

```tsx
keyof (A & B) = (keyof A) | (keyof B);
keyof (A | B) = (keyof A) & (keyof B);
```

> 타입이 집합이라는 관점에서 extends 의 의미는 '~에 할당 가능한' 과 비슷하게 '~의 부분집합' 이라는 의미로 받아들일 수 있다.

---

💬 조금 더 일반적으로 `PersonSpan` 타입을 선언하는 방법은 `extends` 키워드를 사용하는 것입니다. 즉, '`PersonSpan`은 `Person`의 부분집합이다' 로 해석 가능합니다.

```tsx
interface Person {
  name: string;
}

interface PersonSpan extends Person {
  birth: Date;
  death?: Date;
}
```

💬 '서브타입' 이라는 용어가 있습니다. 어떤 집합이 다른 집합의 부분 집합이라는 의미입니다. 1, 2, 3 차원 벡터의 관점에서 생각해 보면 다음과 같은 코드를 작성할 수 있습니다.

```tsx
interface Vector1D {
  x: number;
}
interface Vector2D extends Vector1D {
  y: number;
}
interface Vector3D extends Vector2D {
  z: number;
}
```

> extends 키워드는 제네릭 타입에서 한정자로도 쓰인다.

---

💬 아래의 문맥에서의 `extends` 는 '~의 부분 집합'을 의미하기도 합니다. `string`을 상속한다는 의미를 객체 상속의 관점으로 생각한다면 이해하기가 어렵습니다. 반면 '`string`의 부분 집합 범위를 가지는 어떠한 타입이다' 라는 관점으로 접근하면 쉽게 이해할 수 있습니다.

```tsx
function getKey<k extends string>(val: any, key: K) {
	//...
}

getKey({},'x'); //string 리터럴 'x'는 string을 상속
getKey({}, Math.random() < 0.5 ? 'a' | 'b'); //string 리터럴 타입의 유니온 'a' | 'b' 는 string을 상속
getKey({}, document.title); //string은 string을 상속
getKey({}, 12); //~~'12'형식의 인수는 'string' 형식의 매개변수에 할당될 수 없습니다.
```

💬 타입들이 엄격한 상속 관계가 아닐 때는 집합 스타일이 더욱 바람직합니다.

```tsx
interface Point {
  x: number;
  y: number;
}

type PointKeys = keyof Point;

function sortBy<K extends keyof T, T>(vals: T[], key: K): T[] {
  let ts: T[] = [];
  return ts;
}

const pts: Point[] = [
  { x: 1, y: 1 },
  { x: 2, y: 0 },
];
sortBy(pts, "x"); //'x'는 'x' | 'y'를 상속
sortBy(pts, "y"); //'y'는 'x' | 'y'를 상속
sortBy(pts, Math.random() < 0.5 ? "x" : "y"); //'x' | 'y'는 'x' | 'y'를 상속
sortBy(pts, "z"); //'"z"' 형식의 인수는 '"x" | "y"' 형식의 매개변수에 할당 될 수 없습니다.
```

💬 가끔 `Exclude` 를 사용해서 일부 타입을 제외할 수는 있지만, 그 결과가 적절한 타입스크립트 타입일 때만 유효합니다.

```tsx
type T = Exclude<string | Date, string | number>; //T 타입은 Date
type NonZeroNums = Exclude<number, 0>; //NonZeroNums 타입은 여전히 number
```

> 정리하자면 다음과 같다.

---

💬 타입을 값의 집합으로 생각하면 이해하기 편합니다. 이 집합은 유한하거나 무한합니다.

💬 타입스크립트 타입은 엄격한 상속 관계가 아니라 벤 다이어그램처럼 겹쳐지는 집합으로 표현됩니다. 두 타입은 서로 서브타입이 아니면서도 겹쳐질 수 있습니다.

💬 한 객체의 추가적인 속성이 타입 선언에 언급되지 않더라도 그 타입에 속할 수 있습니다.

💬 타입 연산은 집합의 범위에 적용됩니다. A와 B의 인터섹션은 A의 범위와 B의 범위의 인터섹션입니다. 객체 타입에서는 A & B인 값이 A와 B의 속성을 모두 가짐을 의미합니다.

💬 'A는 B를 상속', 'A는 B에 할당 가능', 'A는 B의 서브타입'은 'A는 B의 부분 집합'과 같은 의미입니다.
