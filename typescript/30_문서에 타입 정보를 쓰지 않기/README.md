# 아이템30. 문서에 타입 정보를 쓰지 않기

```ts
/**
 * Returns a string with the foreground color.
 * Takes zero or one arguments. With no arguments, returns the
 * standard foreground color. With one argument, returns the foreground color
 * for a particular page.
 */
function getForegroundColor(page?: string) {
  return page === "login" ? { r: 127, g: 127, b: 127 } : { r: 0, g: 0, b: 0 };
}
```

주석과 함께 작성된 코드는 주석의 정보와 맞지 않게 되는 경우가 자주 있다. 누군가 강제하지 않는 이상 주석은 코드와 동기화되지 않다.
위의 코드에서 주석의 정보가 맞지 않는다. 둘 중 어느 것이 옳은지 판단하기에는 정보가 부족하며, 잘못된 상태인 것만 분명하다.

타입스크립트의 타입 구문 시스템은 간결하고, 쉽게 읽을 수 있게 설계되었다. 타입 시스템 개발자들은 수 십년 경험을 가진 언어 전문가이다.
**함수의 입력과 출력의 타입을 코드로 표현하는 것이 주석보다 더 나은 방법이다.**

타입 구문은 타입스크립트 컴파일러가 체크해 주기 때문에, 절대로 구현체와의 정합성이 어긋나지 않는다. 누군가 주석을 갱신하는 것을 깜빡할 수 있지만,
타입 구문은 타입스크립트 타입 체커가 타입 정보를 동기화하도록 강제한다. 주석 대신 타입 정보를 작성한다면 코드가 변경된다 하더라도 정보가 정확히 동기화된다.

아래와 같이 타입 정보에 대한 주석을 제외한 함수의 역할을 주석으로 표현하는 것이 나으며, 특정 매개변수를 설명하고 싶다면, JSDoc의 `@param` 구분을 사용하면 된다.

```ts
/* 애플리케이션 또는 특정 페이지의 전경색을 가져옵니다. */
function getForegroundColor(page?: string): Color {}
```

값, 매개변수를 변경하지 않는다고 설명하는 주석보다는 `readonly`로 선언해서 타입스크립트가 규칙을 강제하는 것이 낫다.

```ts
/* nums를 변경하지 않습니다. */
//bad
function sort(nums: number[]) {}

//good
function sort(nums: readonly number[]) {}
```

주석에 적용한 규칙은 변수명에도 그대로 적용할 수 있다. 변수명에 타입 정보를 넣지 않고, 그 타입을 명시하는 것이 낫다.

```ts
//bad
const ageNum = 30;

//good
const age: number = 30;
```
