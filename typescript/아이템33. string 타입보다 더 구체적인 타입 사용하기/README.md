# 아이템32. string 타입보다 더 구체적인 타입 사용하기

**`string` 타입의 범위는 매우 넓다. `string` 타입을 변수로 선언하려면, 그 보다 좁은 타입이 적절하지는 않을지
검토해 보아야 한다.** 음악 컬렉션을 만들기 위해 앨범의 타입을 정의한다고 가정해보자.

```ts
interface Album {
  artist: string;
  title: string;
  releaseDate: string; // YYYY-MM-DD
  recordingType: string; // E.g., "live" or "studio"
}
```

[아이템.31](../아이템30. 문서에 타입 정보를 쓰지 않기/README.md)에서 다루었듯 주석에 타입 정보를 적어둔 것을 보면
현재 인터페이스에 문제가 존재한다는 것을 알 수 있다. 여기서 남발한 `string` 타입의 문제점을 사용처에서 찾아보자.

```ts
const kindOfBlue: Album = {
  artist: "Miles Davis",
  title: "Kind of Blue",
  releaseDate: "August 17th, 1959", // Oops!
  recordingType: "Studio", // Oops!
}; // OK
```

releaseDate 필드의 값은 주석에 설명된 값과 다르다. recordingType 필드 또한 소문자가 아닌 대문자를 사용했지만, 이 두 값 모두 문자열이고, 해당 객체는 Album에 할당 가능하며 타입체크를 통과한다.

`string` 타입의 범위가 넓기 때문에 제대로 Album 객체를 사용하더라도 매개변수 순서가 잘못된 것이 오류로 들어나지 않는다.

```ts
function recordRelease(title: string, date: string) {
  /* ... */
}
recordRelease(kindOfBlue.releaseDate, kindOfBlue.title); // OK, should be error
```

앞서 말한 문제들을 방지하기 위해 타입의 범위를 좁히는 방법을 생각해보자. releaseDate는 Date 객체를 사용하여 날짜 형식으로만 제한하는 것이 좋고, recordingType은 "live", "studio" 두 가지 값으로 제한된 유니온 타입으로 정의하여 사용할 수 있다.

```ts
type RecordingType = "studio" | "live";

interface Album {
  artist: string;
  title: string;
  releaseDate: Date;
  recordingType: RecordingType;
}
```

이러한 방식은 타입스크립트가 오류를 더 세밀하게 체크할 수 있도록 하며, 세 가지의 장점을 더 취할 수 있다.

**타입을 명시적으로 정의함으로써 다른 곳으로 값이 전달되어도 타입 정보가 유지된다.** 특정 레코딩 타입의 앨범을
찾는 함수를 작성하여 string 타입으로 recordingType으로 전달받을 수 있지만, Album을 함수 내부에서 사용한다면
recordingType의 유니온 타입은 유지되어 내부적으로 사용할 때는 `RecordingType` 타입으로 유지된다.

```ts
function getAlbumsOfType(recordingType: string): Album[] {
  // COMPRESS
  return [];
  // END
}
```

**타입을 명시적으로 정의하고 해당 타입의 의미를 설명하는 주석을 붙여 넣을 수 있다.** 주석의 타입 정보를 넣기 보다는 해당 타입의 의미를 설명하는 것이 낫다. 또한, **keyof 연산자로 더욱 세밀하게 객체의 속성 체크가 가능해진다.**

```ts
/** 이 녹음은 어떤 환경에서 이루어졌는지? **/
type RecordingType = "live" | "studio";
```

함수의 매개변수에서 string을 잘못 사용하는 것은 흔히 발생한다. 배열에서 한 필드의 값만 추출하는 함수를 작성한다면,
다음과 같이 작성할 수 있다. (언더스코어 라이브러리에는 pluck라는 함수가 있다.)

```ts
function pluck(records, key) {
  return records.map((r) => r[key]);
}

function pluck(records: any[], key: string): any[] {
  return records.map((r) => r[key]);
}
```

타입 체크가 되긴 하지만, `any` 타입이 있어서 정밀하지 못하다. 특히 반환값에 `any`가 사용되는 것은 바람직하지 못하다.
먼저, 타입 시그니처를 개선하는 첫 단계로 제너릭 타입을 도입해보자.

```ts
function pluck<T>(record: T[], key: string): any[] {
  return record.map((r) => r[key]);
  // ~~~~~~ Element implicitly has an 'any' type
  //        because type '{}' has no index signature
}
```

제너릭 타입을 도입하면 오류가 발생하게 된다. key 타입이 `string`이기 때문에 범위가 너무 넓다는 오류이다.
Album의 키로서 가능한 값은 단 네개이다. ('artist', 'title', 'releaseDate', 'recordingType')

이는 `keyof`를 통해 얻을 수 있으니, 아래와 같이 개선할 수 있다.

```ts
function pluck<T>(record: T[], key: keyof T) {
  return record.map((r) => r[key]);
}
```

pluck에 마우스를 올려보면 추론된 타입을 알 수 있는데, `T[keyof T]`는 T 객체 내의 가능한 모든 값의 타입이다.

```ts
function pluck<T>(records: T[], key: keyof T): T[keyof T][];
```

그런데, key의 값으로 하나의 문자열을 넣게 되면 그 범위가 너무 넓어서 적절한 타입으로 볼 수 없다. 예를 들어 releaseDates의 타입을 (string | Date)[]가 아니라, Date[]여야 한다.

```ts
const releaseDates = pluck(albums, "releaseDate"); // Type is (string | Date)[]
```

`keyof T`는 `string`에 비하면 훨씬 범위가 좁지만, 그래도 여전히 넓다. 따라서 범위를 더 좁히기 위해서 `keyof T`의 부분 집합으로 두 번째 제너릭 매개변수를 도입하면 완벽한 타입 시그니처로 사용될 수 있다. 매개변수 타입이 정밀해진 덕분에 언어 서비스는 Album의 키에 자동 완성 기능을 제공할 수 있게 해준다.

```ts
function pluck<T, K extends keyof T>(record: T[], key: K): T[K][] {
  return record.map((r) => r[key]);
}
```

결론적으로, `string`은 `any`와 비슷한 문제를 가지고 있다. 따라서 잘못 사용하게 되면 무효한 값을 허용하고
타입 간의 관계도 감추어 버비고 타입 체커를 방해하고 실제 버그를 찾지 못하게 한다.

`string`의 부분 집합을 정의할 수 있는 기능은 자바스크립트 코드에 타입 안전성을 크게 높이며, 오류를 방지하고 코드의 가독성 또한 향상시킬 수 있다.
