> 타입스크립트의 심벌(symbol)은 타입 공간이나 값 공간 중의 한 곳에 존재한다.

---

💬 심벌은 이름이 같더라도 속하는 공간에 따라 다른 것을 나타낼 수 있습니다. 심벌이 중복된 타입과 값이 공존하지만 서로 아무런 관련이 없으며 문제도 없습니다.

```tsx
interface Cylinder {
  radius: number;
  height: number;
}

const Cylinder = (radius: number, height: number) => ({ radius, height });
```

💬 이런 점에서 가끔 오류를 야기합니다. 아마도 `instanceof` 를 이용해 `shape`가 `Cylinder` 타입인지 체크하려고 했을 겁니다. 그러나, `instanceof`는 자바스크립트의 런타임 연산자이고, 값에 대해서 연산을 합니다.

```tsx
function calculateVolume(shape: unknown) {
  if (shape instanceof Cylinder) {
    shape.radius; // '{}' 형식에 'radius' 속성이 없습니다.
  }
}
```

> 타입스크립트 코드에서 타입과 값은 번갈아 나올 수 있다.

---

💬 타입 선언(:) 또는 단언문(as) 다음에 오는 심벌은 타입입니다. 반면에, = 다음에 나오는 모든 것은 값입니다. 일부 함수에서는 타입과 값이 반복적으로 번갈아 가며 나올 수 있습니다.

```tsx
interface Person {
  first: string;
  last: string;
}

const p: Person = { first: "Jane", last: "Jacobs" };
```

```tsx
function email(p: Person, subject: string, body: string): Response {
	...
}
```

💬 `class`와 `enum`은 상황에 따라 타입과 값 두 가지 모두 가능한 예약어입니다. 다음 예제에서 `Cylinder` 클래스는 타입으로 쓰였습니다. 클래스가 타입으로 쓰일 때는 형태가 사용되는 반면, 값으로 쓰일 때는 생성자로 사용됩니다.

```tsx
class Cylinder {
  radius = 1;
  height = 1;
}

function calculateVolume(shape: unknown) {
  if (shape instanceof Cylinder) {
    shape; //정상, 타입은 Cylinder
    shape.radius; //정상, 타입은 number
  }
}
```

> 연산자 중에서도 타입에서 쓰일 때와 값에서 쓰일 때 다른 기능을 하는 것들이 있다.

---

💬 그 중 예로 `typeof` 를 들 수 있습니다. 타입의 관점에서 `typeof` 는 값을 읽어서 타입스크립트 타입을 반환합니다. 타입의 공간의 `typeof` 는 큰 타입의 일부분으로 사용할 수 있고, `type` 구문으로 이름을 붙이는 용도로도 사용할 수 있습니다. 반면에 값의 관점에서 `typeof` 는 자바스크립트 런타임의 `typeof` 연산자가 됩니다.

```tsx
type T1 = typeof p; //타입은 Person
type T2 = typeof email; // 타입은 (p:Person, subject: string, body: string) => Response

const v1 = typeof p; //값은 'object'
const v2 = typeof email; //값은 'function'
```

💬 `Cylinder` 예제에서 본 것처럼 `class` 키워드는 값과 타입 두 가지로 모두 사용됩니다. 따라서 클래스에 대한 `typeof` 는 상황에 따라 다르게 동작합니다.

```tsx
const v = typeof Cylinder; //값이 'function'
type T = typeof Cylinder; //타입이 typeof Cylinder
```

💬 클래스가 자바스크립트에서는 실제 함수로 구현되기 때문에 첫 번째 줄의 값은 'function'이 됩니다. 두 번째 줄에서 중요한 점은 `Cylinder`가 인스턴스 타입이 아니라는 점입니다. 실제로는 `new` 키워드를 사용할 때 볼 수 있는 생성자 함수입니다.

```tsx
declare let fn: T;
const c = new fn(); //타입이 Cylinder
```

💬 다음 코드처럼 `InstanceType` 제네릭을 사용해 생성자 타입과 인스턴스 타입을 전환할 수 있습니다.

```tsx
type C = InstanceType<typeof Cylinder>; //타입이 Cylinder
```

> 속성 접근자인 []는 타입으로 쓰일 때에도 동일하게 동작한다.

---

💬 속성 접근자인 []는 타입으로 쓰일 때 동일하게 동작합니다. 그러나, `obj['field']`와 `obj.field`는 값이 동일하더라도 타입은 다를 수 있습니다. 따라서 타입의 속성을 얻을 때에는 `obj['field']`를 사용해야 합니다.

```tsx
interface Person {
  first: string;
  last: string;
}

const first: Person["first"] = p["first"]; //또는 p.first
```
