# 아이템25. 비동기 코드에는 콜백 대신 async 함수 사용하기

자바스크립트에서는 비동기 동작을 모델링하기 위해 콜백을 사용했고, '콜백 지옥'을 필연적으로 마주할 수 밖에 없었다.
실행 순서는 코드의 순서와 반대인 구조로 중첩된 코드는 직관적으로 이해하기 어려웠다.

ES2015는 콜백지옥을 극복하기 위해 프로미스(Promise) 개념을 도입했다. 프로미스는 미래에 가능해질 어떤 것을 나타낸다.
코드의 중첩도 적어졌고, 실행 순서도 코드 순서와 같아졌다. 또한 오류를 처리하기도 Promise.all과 같은 고급 기법을 사용하기도 쉬워졌다.

ES2017에서는 async/await 키워드를 도입하여 콜백 지옥을 더욱 간단하게 처리할 수 있게 되었다.

```ts
async function fetchPages() {
  const response1 = await fetch(url1);
  const response2 = await fetch(url2);
  const response3 = await fetch(url3);
  // ...
}
```

await는 각각의 프로미스가 resolve될 때까지 fetchPages 함수의 실행을 멈춘다. await 중인 프로미스가 reject되면 예외를 던지고
이를 try/catch 구문을 통해 에러를 캐치할 수 있다.

타입스크립트 컴파일러는 ES5 혹은 더 이전 버전을 대상으로 할 때 async/await가 동작하도록 정교한 변환을 한다. 즉 타입스크립트는 런타임에 관계없이 async/await를 사용할 수 있다.

콜백보다는 프로미스나 async/await를 사용해야 하는 이유는 **콜백보다 프로미스가 코드를 작성하기 쉬울 뿐더러, 프로미스가 타입을 추론하기 쉽기 때문이다.**

예를 들어, 병렬로 페이지를 로드하고 싶다면 Promise.all을 사용해서 프로미스를 조합하면 된다. 이런 경우 await와 구조 분해 할당이 찰떡궁합이다.

```ts
async function fetchPages() {
  const [response1, response2, response3] = await Promise.all([
    fetch(url1),
    fetch(url2),
    fetch(url3),
  ]);
  // ...
}
```

입력된 프로미스들 중 첫 번째가 처리될 때 완료되는 Promise.race도 타입 추론과 잘 맞다. Promise.race를 사용하여 프로미스에 타임아웃을 추가하는 방법은 흔하게 사용되는 패턴이다.

```ts
function timeout(millis: number): Promise<never> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject("timeout"), millis);
  });
}

async function fetchWithTimeout(url: string, ms: number) {
  return Promise.race([fetch(url), timeout(ms)]);
}
```

타입 구문이 없어도 fetchWithTimeout의 반환 타입은 Promise<Response>로 추론된다. Promise.race의 반환 타입은 입력 타입들의 유니온이고, 이 경우 Promise<Reponse | never>가 된다. 그러나, never와의 유니온 표현은 아무런 효과가 없으므로 결과가 Promise<Response>로 간단해진다.

가끔 setTimeout과 같은 콜백 API를 래핑하여 프로미스를 직접 생성해야 할 때가 있는데, 선택의 여지가 있다면 일반적으로는 프로미스를 생성하기 보다는 async/await를 사용해야 한다. **일반적으로 더 간결하고 직관적인 코드가 되며, async 함수는 항상 프로미스를 반환하도록 강제되기 때문이다.**

```ts
// function getNumber(): Promise<number>
async function getNumber() {
  return 42;
}

const getNumber = async () => 42; // Type is () => Promise<number>

const getNumber = () => Promise.resolve(42); // Type is () => Promise<number>
```

즉시 사용 가능한 값에도 프로미스를 반환하는 것이 이상하게 보일 수 있지만, **비동기 함수로 통일하도록 강제하는 데 도움이 된다. 함수는 항상 동기와 비동기를 혼용해서는 안된다.**

fetchURL 함수에 캐시를 추가하기 위해 다음처럼 시도한다면, 코드가 최적화되 것 처럼 보일지 몰라도, 캐시된 경우 콜백 함수가 동기로 호출되기 때문에 fetchWithCache 함수는 사용하기가 어려워진다.

```ts
const _cache: { [url: string]: string } = {};
function fetchWithCache(url: string, callback: (text: string) => void) {
  if (url in _cache) {
    callback(_cache[url]);
  } else {
    fetchURL(url, (text) => {
      _cache[url] = text;
      callback(text);
    });
  }
}
```

콜백이나 프로미스를 사용하면 실수로 반동기 코드를 작성할 수 있지만, async를 사용하면 항상 비동기 코드를 작성하는 셈이다. async 함수에서 프로미스를 반환하면 또 다른 프로미스로 래핑되지 않는다. 반환 타입은 Promise<Promise<T>>가 아닌 Promise<T>가 된다. 타입스크립트를 사용하면 타입 정보가 명확히 드러나기 때문에 비동기 코드의 개념을 잡는 데 도움이 된다.

```ts
// Function getJSON(url: string): Promise<any>
async function getJSON(url: string) {
  const response = await fetch(url);
  const jsonPromise = response.json(); // Type is Promise<any>
  return jsonPromise;
}
```

콜백보다는 프로미스나 async/await를 사용하면 코드가 보다 간결해지고, 타입스크립트에서는 프로미스 타입 추론을 더 쉽게 해내며,
동기와 비동기 함수를 혼용하지 않게 되고, async가 붙은 비동기 함수의 반환을 프로미스로 강제할 수 있기 때문이다.
