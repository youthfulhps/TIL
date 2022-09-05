# 아이템51. 의존성 분리를 위해 미러 타입 사용하기

CSV 파일을 파싱하는 라이브러리를 작성한다고 가정해 보자.
parseCSV API는 간단한데, CSV 파일의 내용을 매개변수로 받고,
열 이름을 값으로 매핑하는 객체들을 생성하여 배열로 반환한다.
그리고, NodeJS 사용자를 위해 매개변수에 Buffer 타입을 허용한다.

```ts
function parseCSV(contents: string | Buffer): { [column: string]: string }[] {
  if (typeof contents === "object") {
    // It's a buffer
    return parseCSV(contents.toString("utf8"));
  }
  // COMPRESS
  return [];
  // END
}
```

Buffer의 타입 정의는 NodeJS 타입 선언을 설치해서 얻을 수 있다.

앞에서 작성한 CSV 파싱 라이브러리를 공개하면 타입 선언도 포함하게 된다.
타입 선언이 @types/node에 의존하기 때문에 @types/node는
devDependencies에 포함되어야 한다.

하지만, @types와 무관한 자바스크립트 개발자나, NodeJS와 무관한 타입스크립트 개발자의 경우,
devDependencies로 추가된 타입 선언 라이브러리 때문에 혼란스러울 수 있다.

이때, 각자가 필요한 모듈만 사용할 수 있도록 구조적 타이핑을 적용할 수 있다.
**@types/node에 있는 Buffer 선언을 사용하지 않고, 필요한 메서드 속성만 별도로 작성하는 것이다.**

```ts
interface CsvBuffer {
  toString(encoding: string): string;
}
function parseCSV(
  contents: string | CsvBuffer
): { [column: string]: string }[] {
  // COMPRESS
  return [];
  // END
}
```

CsvBuffer는 Buffer의 미러타입으로, Buffer 인터페이스보다 훨씬 간결하고
실제 필요한 부분만을 떼어 명시할 수 있다. 또한 해당 타입이 Buffer와 호환되기
때문에 NodeJS 프로젝트에서는 실제 Buffer 인스턴스로 parseCSV를 호출하는 것이
가능하다.

```ts
parseCSV(new Buffer("column1,column2\nval1,val2", "utf-8")); // OK
```

사용자 입장에서 라이브러리 사용처와 무관한 타입에 의존하는 경우,
필요한 선언부만 추출하여 작성 중인 라이브러리에 넣는 것을 고려해 보는 것이 좋다.
