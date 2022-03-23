# 아이템 20. 다른 타입에는 다른 변수 사용하기

자바스크립트에서는 한 변수를 다른 목적을 가지는 다른 타입으로 재사용해도 된다. 하지만, 타입스크립트에서는 관점이 다르다. '변수의 값은 바뀔 수 있지만, 그 타입은 보통 바뀌지 않는다'.

자바스크립트에서 다른 용도로 사용하기 위해 재할당을 하는 경우이다. 동일한 방식으로 타입스크립트에서 사용하면 두 가지 오류가 발생한다. 타입스크립트는 id 값을 string 타입으로 추론했다. string 타입에는 number를 할당할 수 없기 때문에 오류가 발생한다.

```js
function fetchProduct(id) {}
function fetchProductBySerialNumber(id) {}
let id = "12-34-56";
fetchProduct(id);
```

```ts
id = 123456;
fetchProductBySerialNumber(id);
function fetchProduct(id: string) {}
function fetchProductBySerialNumber(id: number) {}
let id = "12-34-56";
fetchProduct(id);

id = 123456;
// ~~ '123456' is not assignable to type 'string'.
fetchProductBySerialNumber(id);
// ~~ Argument of type 'string' is not assignable to
//    parameter of type 'number'
```

타입을 바꿀 수 있는 한 가지 방법은 범위를 좁히는 것이다. 새로운 변수값을 포함하도록 확장하는 것이 아니라, 타입을 더 작게 제한하는 것이다. 여기서 id 타입을 변경하고자 한다면, 유니온 타입을 사용하여 string과 number를 모두 포함할 수 있는 타입을 확장하면 된다.

```ts
function fetchProduct(id: string) {}
function fetchProductBySerialNumber(id: number) {}
let id: string | number = "12-34-56";
fetchProduct(id);

id = 123456; // OK
fetchProductBySerialNumber(id); // OK
```

하지만, 유니온 타입의 사용은 더 많은 문제를 야기할 수 있다. id를 사용할 때마다 어떤 타입인지 확인해야 하기 때문에 차라리 별도의 변수를 도입하는 것이 낫다.

```ts
function fetchProduct(id: string) {}
function fetchProductBySerialNumber(id: number) {}
const id = "12-34-56";
fetchProduct(id);

const serial = 123456; // OK
fetchProductBySerialNumber(serial); // OK
```

변수를 무분별하게 사용하는 것은 바람직하지 않지만, 다른 타입에는 별도의 변수를 사용하는 게 바람직하다. 그 이유는 다음과 같다.

서로 관련이 없는 두 개의 값을 분리할 수 있다.
변수명을 더 구체적으로 지을 수 있다.
타입 추론을 향상시키고, 타입 구문이 불 필요해진다.
타입이 좀 더 간결해진다. (string | number 대신, string과 number 사용)
let 대신 const를 사용할 수 있다. const는 코드가 간결해지고 타입체커가 타입을 추론하는 데 좋다.
여기서, '가려지는' 변수는 예외이다. 혼동해서는 안된다. 하지만, '가려지는' 변수는 되도록 사용을 막고 있기 떄문에 위의 조언을 따를 필요가 있다.

```ts
function fetchProduct(id: string) {}
function fetchProductBySerialNumber(id: number) {}
const id = "12-34-56";
fetchProduct(id);

{
  const id = 123456; // OK
  fetchProductBySerialNumber(id); // OK
}
```
