# 아이템47. 공개 API에 등장하는 모든 타입을 익스포트하기

타입스크립트를 사용하다 보면, 언젠가는 서드파티의 모듈에서 익스포트되지 않은 타입 정보가 필요한 경우가 있다.
다행히 타입 간의 매핑해주는 도구가 많이 있고, 웬만하면 필요한 타입을 참조하는 방법을 찾을 수 있다.

이 말은 즉슨, 만약 라이브러리를 제작하는 입장에서 프로젝트 초기에 타입 익스포트를 작성해야 한다는 의미이다.
만약, 함수의 선언에 이미 타입 정보가 있다면 제대로 익스포트되고 있는 것이고, 그 반대는 타입을 명시적으로
작성해야 한다.

만약, 특정 타입을 숨기려 익스포트하지 않았다면, 해당 라이브러리 사용자는 SecretName 또는 SecretSanta를 직접
임포트할 수 없다.

```ts
interface SecretName {
  first: string;
  last: string;
}

interface SecretSanta {
  name: SecretName;
  gift: string;
}

export function getGift(name: Secretname, gift: string): SecretSanta {
  //...
}
```

그러나, 타입들은 익스포트된 함수 시그니처에 등장하기 때문에 추출이 가능하다.
추출하는 한 가지 방법은 `Paramters`와 `ReturnType` 제너릭 타입을 사용하는 것이다.

```ts
type MySanta = ReturnType<typeof getGift>; //SecretSanta
type MyName = Parameters<typeof getGift>[0]; //SecretName
```

**만약, 프로젝트의 융통성을 위해 타입들을 일부러 익스포트하지 않았던 것이라면,
쓸데없는 작업을 한 셈이며, 공개 API 매개변수에 놓이는 순간 타입은 노출된다.**
그러므로, 라이브러리 사용자를 위해 명시적으로 익스포트하는 것이 좋다.
