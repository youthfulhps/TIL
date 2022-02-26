> 자바스크립트는 덕 타이핑(duck typing) 기반이고, 타입스크립트가 이를 모델링하기 위해 구조적 타이핑을 사용함을 이해해야 한다.

💬 구조적 타이핑이라는 용어가 사용되기 위해 아래와 같은 예시를 들 수 있습니다. `Vector2D` 와 `NamedVector` 의 관계를 전혀 선언하지 않았지만, `calculateLength` 의 매개변수로 `NamedVector` 타입을 사용해도 정상적으로 결과를 반환합니다.

```tsx
interface Vector2D {
  x: number;
  y: number;
}

function calculateLength(v: Vector2D) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

interface NamedVector {
  name: string;
  x: number;
  y: number;
}

const v: NamedVector = { x: 3, y: 4, name: "Zee" };
calculateLength(v);
```

💬 구조적 타이핑 때문에 문제가 발생하기도 합니다. 벡터의 길이를 1로 만드는 정규화 함수를 작성합니다. 하지만, 이 함수는 1보다 조금 더 긴 결과를 출력합니다.

💬 `Vector2D` 기반으로 연산 결과를 반환하는 `calculateLength` 에서 3D 벡터로 연산되었고, 정규화 과정에서 z가 무시되었지만, 타입 체커는 이 문제를 잡아내지 못했습니다. 결론적으로, `calculateLength` 는 2D 벡터를 받도록 선언되었음에도 불구하고 3D 벡터를 받는 데 문제가 없었습니다.

```tsx
interface Vector3D {
  x: number;
  y: number;
  z: number;
}

function normalize(v: Vector3D) {
  const length = calculateLength(v);

  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length,
  };
}

normalize({ x: 3, y: 4, z: 5 }); // {x: 0.6, y: 0.8, z: 1}
```

💬 구조적 타이핑 관점에서 `Vector3D` 와 호환되는 `{x, y, z}` 객체는 `Vector2D` 의 x, y 와 호환됩니다. 따라서, 오류가 발생하지 않았고, 타입 체커 또한 문제로 지적하지 않았습니다.

함수를 작성할 때, 호출에 사용되는 매개변수의 속성들이 매개변수의 타입에 선언된 속성만을 가질 거라 생각하기 쉽다. 이러한 타입은 '봉인된 (sealed)' 또는 '정확한 (precise)' 타입이라고 불리며, 타입스크립트 타입 시스템에서는 표현할 수 없다. **좋든 싫은 타입은 '열려 (open)' 있다.**

열려 있다는 것은 타입의 확장에 열려 있다는 의미이다. 즉, 타입에 선언된 속성 외에 임의의 속성을 추가하더라도 오류가 발생하지 않는 것이다. 고양이라는 타입에 크기 속성을 추가하여 '작은 고양이'가 되어도 고양이라는 사실은 변하지 않는 것처럼 말이다.

💬 구조적 타이핑으로 인해 발생하는 경우를 오류로 처리하기 위한 설정이 존재합니다. 이후 자세히 다룹니다.

💬 이러한 특성은 종종 당황스러운 결과를 발생합니다. `axis` 는 `Vector3D` 타입인 v의 키 중 하나이기 때문에 'x', 'y', 'z' 중 하나여야 하고, `coord` 또한 `number` 로 예상됩니다. 하지만, 구조적 타이핑 기반을 모델링하는 타입스크립트는 아래와 같은 오류를 찾아냅니다.

```tsx
function calculateLengthL1(v: Vector3D) {
  let length = 0;
  for (const axis of Object.keys(v)) {
    const coord = v[axis];
    //'string'은 'Vector3D'의 인덱스로 사용할 수 없기에
    //엘리먼트는 암시적으로 'any'타입입니다.
    length += Math.abs(coord);
  }
  return length;
}
```

💬 타입체커가 지적한 타입 오류는 예상과는 다르지만, 아래와 같은 예시로 타입 체커의 경고가 올바르다는 것을 증명합니다.

```tsx
const vec3D = { x: 3, y: 4, z: 1, address: "123 Broadway" };
calcalateLengthL1(vec3D); //정상, NaN
```

💬 구조적 타이핑은 클래스와 관련된 할당문에서도 당황스러운 결과를 보여 줍니다. `d` 는 `string` 타입의 `foo` 속성을 가지며, 하나의 매개변수로 호출이 되는 생성자를 가집니다. 즉, 구조적으로 필요한 속성과 생성자가 존재하기 때문에 문제없습니다. 다만, C의 생성자에 단순 할당이 아닌 연산 로직이 존재한다면 `d` 의 경우 생성자를 실행하지 않으므로 문제가 발생하게 됩니다.

```tsx
class C {
  foo: string;
  constructor(foo: string) {
    this.foo = foo;
  }
}

const c = new C("instance of C");
const d: C = { foo: "object literal" }; //정상
```
