# 아이템 15. 동적 데이터에 인덱스 시그니처 사용하기

자바스크립트 객체는 문자열 키를 타입의 값에 관계없이 매핑한다. 타입스크립트에서는 타입에 '인덱스 시그니처'를 명시하여 유연하게 매핑을 표현할 수 있다.

```ts
type Rocket = { [property: string]: string };
const rocket: Rocket = {
  name: "Falcon 9",
  variant: "v1.0",
  thrust: "4,940 kN",
}; // OK
```

`[property: string]: string` 는 키의 위치를 표시하는 용도의 **키의 이름** 과 `string | number | symbol`의 조합이어야 하지만, 일반적으로 `string`로 사용되는 **키의 타입**, 어떤 것이든 될 수 있는 **값의 타입** 으로 구성되어 있다.

하지만, 이렇게 타입 체크가 수행되면, 잘못된 키를 포함하여 모든 키를 허용하게 되므로, 특정 키가 필요없어진다.
또한, 키마다 다른 타입을 가질 수 없으며, 객체의 키값에 대한 자동완성 기능을 제공받지 못하게 된다.

결론적으로 더 나은 방법을 찾아야 한다. 즉, 인덱스 시그니처는 동적 데이터를 포현할 때 사용해야 한다. 예를 들어, CSV 파일처럼 해더 행에 열이 있고, 데이터 행을 열 이름과 값으로 매칭하는 객체로 나타내고 싶은 경우이다.

```ts
function parseCSV(input: string): { [columnName: string]: string }[] {
  const lines = input.split("\n");
  const [header, ...rows] = lines;
  return rows.map((rowStr) => {
    const row: { [columnName: string]: string } = {};
    rowStr.split(",").forEach((cell, i) => {
      row[header[i]] = cell;
    });
    return row;
  });
}
```

일반적인 상황에서 열 이름이 무엇인지 미리 알 수 있는 방법이 없다. 이럴 때 인덱스 시그니처 사용이 적합하다.

어떤 타입에 가능한 필드가 제한되어 있는 경우라면 인덱스 시그니처로 모델링하지 말아야 한다. 예를 들어 데이터에 A,B,C,D 같은 키가 있지만, 얼마나 많이 있는 지 모른다면, 선택적 필드 또는 유니온 타입으로 모델링하면 된다.

```ts
interface Row1 {
  [column: string]: number;
} // Too broad
interface Row2 {
  a: number;
  b?: number;
  c?: number;
  d?: number;
} // Better
type Row3 =
  | { a: number }
  | { a: number; b: number }
  | { a: number; b: number; c: number }
  | { a: number; b: number; c: number; d: number };
```

하지만, 사용하기에는 번거로운 부분이 있다. string 타입이 너무 광범위해서 인덱스 시그니처를 사용하는 데 문제가 있다면, 두 가지 대안을 생각해볼 수 있다.

첫번 째, `Record`를 사용하는 방법이다. `Record`는 키 타입에 유연성을 제공하는 제네릭 타입이다. 특히, string의 부분 집합을 사용할 수 있다.

```ts
type Vec3D = Record<"x" | "y" | "z", number>;
// Type Vec3D = {
//   x: number;
//   y: number;
//   z: number;
// }
```

두 번째, 매핑된 타입을 사용하는 방법이다. 매핑된 타입은 키마다 별도의 타입을 사용하게 해준다.

```ts
type Vec3D = { [k in "x" | "y" | "z"]: number };
// Same as above
type ABC = { [k in "a" | "b" | "c"]: k extends "b" ? string : number };
// Type ABC = {
//   a: number;
//   b: string;
//   c: number;
// }
```
