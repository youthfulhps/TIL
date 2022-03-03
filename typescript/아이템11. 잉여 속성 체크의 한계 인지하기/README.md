# 아이템 11. 잉여 속성 체크의 한계 인지하기

> 타입이 명시된 변수에 객체 리터럴을 할당할 때 타입스크립트는 해당 타입의 속성이 있는지, 그리고 '그 외의 속성은 없는지' 확인한다

---

Room 타입에 element 속성이 있는 것이 어색하긴 하지만, **구조적 타이핑 관점으로 생각해보면 오류가 발생하지 않아야 한다**
이는 임시변수를 도입해보면 알 수 있는데, obj 객체는 Room 타입에 할당이 가능하다.

```ts
interface Room {
  numDoors: number;
  ceilingHeightFt: number;
}
const r: Room = {
  numDoors: 1,
  ceilingHeightFt: 10,
  elephant: "present",
  // ~~~~~~~~~~~~~~~~~~ Object literal may only specify known properties,
  //                    and 'elephant' does not exist in type 'Room'
};
```

```ts
interface Room {
  numDoors: number;
  ceilingHeightFt: number;
}
const obj = {
  numDoors: 1,
  ceilingHeightFt: 10,
  elephant: "present",
};
const r: Room = obj; // OK
```

obj의 타입은 타입 체커에 의해 타입이 추론되며, obj 타입은 Room 타입의 부분 집합을 포함하므로, Room에 할당 가능하다.

즉, 첫 번째 예제에서는, 구조적 타입 시스템에서 발생할 수 있는 중요한 종류의 오류를 잡을 수 있도록 '잉여 속성 체크'라는 과정을 수행했다.
하지만, '잉여 속성 체크'는 조건에 따라 동작하지 않는다는 한계가 있다. 통상적인 '할당 가능 검사'와 함께 쓰이면 구조적 타이핑이 무엇인지 혼란스러워 질 수 있다.

**'잉여 속성 체크'가 '할당 가능 검사'와는 별도의 과정이라는 것을 알아야 타입스크립트 타입 시스템에 대한 개념을 정확히 잡을 수 있다.**

타입스크립트는 단순히 런타임에 예외를 던지는 코드에 오류를 표시하는 것뿐 아니라, 의도와 다르게 작성된 코드까지 찾으려 한다.

```ts
interface Options {
  title: string;
  darkMode?: boolean;
}
function createWindow(options: Options) {
  if (options.darkMode) {
    setDarkMode();
  }
  // ...
}
createWindow({
  title: "Spider Solitaire",
  darkmode: true,
  // ~~~~~~~~~~~~~ Object literal may only specify known properties, but
  //               'darkmode' does not exist in type 'Options'.
  //               Did you mean to write 'darkMode'?
});
```

위의 코드를 실행하면 런타임에 어떠한 오류도 발생하지 않는다. 그러나 타입스크립트는 의도한 대로 동작하지 않을 수 있음을 오류 메세지를 통해 전한다.
`Options` 타입은 범위가 매우 넓기 때문에, 순수한 구조적 타입 체커는 이런 종류의 오류를 찾아내지 못한다.

darkMode에 boolean 타입이 아닌 다른 타입의 값이 지정된 경우를 제외하고, **string 타입인 title 속성과 또 다른 어떤 속성을 가지는 모든 객체는 Options 타입 범위에 속한다.** 아래의 예시로 document, HTMLAnchorElement의 인스턴스 모두 string 타입인 title 속성을 가지고 있기 때문에 할당문은 정상이다.

```ts
const o1: Options = document; // OK
const o2: Options = new HTMLAnchorElement(); // OK
```

**'잉여 속성 체크'를 이용하면 기본적으로 타입 시스템의 구조적 본질을 해치지 않으면서도 객체 리터럴에 알 수 없는 속성을 허용하지 않음으로써 이러한 문제점을 방지할 수 있다.**

💬 객체 리터럴을 사용하여 '잉여 속성 체크'가 적용되도록 할 수 있다. '잉여 속성 체크'는 타입 단언문을 사용할 때에도 적용되지 않는다. 이것은 단언문보다 선언문을 사용해야 하는 단적인 이유 중 하나이다.

만약, '잉여 속성 체크'를 원치 않는다면, **인덱스 시그니처** 를 사용해서 타입스크립트가 추가적인 속성을 예상하도록 할 수 있다.

```ts
interface Options {
  darkMode?: boolean;
  [otherOptions: string]: unknown;
}
const o: Options = { darkmode: true }; // OK
```

선택적 속성만 가지는 '약한 (weak)' 타입에도 비슷한 체크가 동작한다.

```ts
interface LineChartOptions {
  logscale?: boolean;
  invertedYAxis?: boolean;
  areaChart?: boolean;
}
const opts = { logScale: true };
const o: LineChartOptions = opts;
// ~ Type '{ logScale: boolean; }' has no properties in common
//   with type 'LineChartOptions'
```

구조적 관점에서 LineChartOptions 타입은 모든 속성이 선택적이므로 모든 객체를 포함할 수 있다.

이런 약한 타입에 대해서 타입스크립트는 값 타입과 선언 타입에 공통된 속성이 있는지 확인하는 별도의 체크를 수행할 수 있고, '공통 속성 체크'는 '잉여 속성 체크'와 마찬가지로 오타를 잡는 데 효과적이며 구조적으로 엄격하지 않다.

'잉여 속성 체크'는 구조적 타이핑 시스템에서 허용되는 속성 이름의 오타 같은 실수를 잡아내는 데 효과적이다. 선택적 필드를 포함하는 Options 같은 타입에 특히 유용하지만, 적용 범위도 매우 제한적이고 오직 객체 리터럴에서만 수행한다. 이러한 한계점을 인지하고 '잉여 속성 체크', '일반적인 타입 체크'를 구분한다면 두 가지 모두의 개념을 잡는 데에 도움이 된다.
