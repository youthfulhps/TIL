# 아이템39. any를 구체적으로 변형해서 사용하기

any는 자바스크립트에서 표현할 수 있는 모든 값을 아우르는 매우 큰 범위의 타입이다.
any 타입에는 모든 숫자, 문자열, 배열, 객체, 정규식, 함수, 클래스, DOM 엘리먼트는 물론
null, undefined 또한 포함된다. 반대로 말하면 any를 사용하는 것보다 구체적으로 표현할 수 있는 타입이 존재할 가능성이
높기 때문에, 더 구체적인 타입을 찾아 타입 안정성을 높이도록 할 필요가 있다는 것이다.

예를 들어 any 타입의 값을 그대로 정규식이나, 함수에 넣는 것은 권장하지 않는다.

```ts
function getLengthBad(array: any) {
  // Don't do this!
  return array.length;
}

function getLength(array: any[]) {
  return array.length;
}
```

이 경우, getLengthBad 보단 getLength가 더 나은 형태인데, 함수 내의 array.length 타입이 체크되며,
함수의 반환 타입이 any 대신 number로 추론되고, 함수가 호출될 때 매개변수가 배열인지 체크되기 때문이다.

배열이 아닌 값을 넣게 되면, getLength는 제대로 오류를 표시하지만, getLengthBad는 오류를 잡아내지 못한다.

```ts
getLengthBad(/123/); // No error, returns undefined
getLength(/123/);
// ~~~~~ Argument of type 'RegExp' is not assignable
//       to parameter of type 'any[]'
```

함수의 매개변수를 구체화할 때 배열의 배열 형태라면 `any[][]` 로 선언하면 되며, 함수의 매개변수가 객체이긴 하지만,
값을 알 수 없다면, `{[key: string]: any}` 처럼 선언하면 된다.

```ts
function hasTwelveLetterKey(o: { [key: string]: any }) {
  for (const key in o) {
    if (key.length === 12) {
      return true;
    }
  }
  return false;
}
```

또한 매개변수가 객체이지만, 값을 알 수 없다면 `{[key: string]: any}` 대신 비기본형 타입을 모두 포함하는 `object`
타입을 사용할 수도 있다. 여기서, object 타입은 객체의 키를 열거할 수는 있지만, 속성에 접근할 수는 없다는 점에서 차이가 있다.

```ts
function hasTwelveLetterKey(o: object) {
  for (const key in o) {
    if (key.length === 12) {
      console.log(key, o[key]);
      //  ~~~~~~ Element implicitly has an 'any' type
      //         because type '{}' has no index signature
      return true;
    }
  }
  return false;
}
```

함수의 타입에도 단순히 any를 사용해서는 안된다. 최소한으로 구체화할 수 있는 방법이 있다.

```ts
type Fn0 = () => any; // any function callable with no params
type Fn1 = (arg: any) => any; // With one param
type FnN = (...args: any[]) => any; // With any number of params
// same as "Function" type
```

위 함수의 타입들은 any를 사용하긴 했지만, 단순히 any를 사용하는 것보다 구체적이다. 마지막 FnN의 경우
`...args`를 any[]로 선언했다. any로 선언해도 동작하지만, any[]로 선언하면 배열 형태라는 것을 알 수 있어 더 구체적이며
다음과 같은 any[] 사용의 대표적인 예시가 있다.

```ts
const numArgsBad = (...args: any) => args.length; // Returns any
const numArgsGood = (...args: any[]) => args.length; // Returns number
```

결과적으로, any를 사용할 때는 정말로 모든 값이 허용되어야만 하는지 면밀히 검토해야 하며, any보다 더 정확하게
모델링할 수 있도록 any[] 또는 `{[id: string]: any}` 또는 `() => any` 처럼 구체적인 형태를 사용해야 한다.
