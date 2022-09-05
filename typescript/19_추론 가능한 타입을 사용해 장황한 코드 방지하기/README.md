# 아이템 19. 추론 가능한 타입을 사용해 장황한 코드 방지하기

자바스크립트 코드를 포팅할 때 가장 먼저 하는 일은 타입 구문을 넣는 것이다. 타입을 위한 언어이기 때문에
변수를 선언할 때마다 타입을 명시해야 한다고 생각하기 쉽다. 하지만, 타입스크립트의 많은 타입 구문은
사실 불필요하다. x는 타입 체커로부터 타입이 이미 number로 추론되었다. 즉, 타입 추론이 된다면 명시적 타입 구문이 필요하지 않다.

```ts
let x: number = 12;
let x = 12;
```

타입스크립트는 더 복잡한 객체도 추론할 수 있다. 타입체커에게 타입 추론을 맡겨도 충분하다.

```ts
const person: {
  name: string;
  born: {
    where: string;
    when: string;
  };
  died: {
    where: string;
    when: string;
  };
} = {
  name: "Sojourner Truth",
  born: {
    where: "Swartekill, NY",
    when: "c.1797",
  },
  died: {
    where: "Battle Creek, MI",
    when: "Nov. 26, 1883",
  },
};

const person = {
  name: "Sojourner Truth",
  born: {
    where: "Swartekill, NY",
    when: "c.1797",
  },
  died: {
    where: "Battle Creek, MI",
    when: "Nov. 26, 1883",
  },
};
```

다음처럼 배열의 경우도 객체와 마찬가지인데, 타입스크립트는 입력을 받아 연산을 하는 함수가 어떤 타입을 반환하는 지 정확하게 알고 있다.

```ts
function square(nums: number[]) {
  return nums.map((x) => x * x);
}
const squares = square([1, 2, 3, 4]); // Type is number[]
```

다음과 같이 어쩌면 더 정확한 추론을 한다. axis 변수를 string으로 예상하기 쉽다. 하지만, 타입스크립트는 "y"로 추론하고 이러한 추론이 더 정확하다.

```ts
const axis1: string = "x";
const axis2 = "y";
```

타입체커에게 타입 추론을 맡기는 것은 타입을 명시하는 것보다 리팩토링에 용이하다. 가령 특정 타입이 변경되었다면 명시적으로 특정 타입을 명시한 값은 모두 에러가 발생하게 된다. 타입 체커에게 추론을 맡기면 아무런 수정없이 타입 체커를 통과할 수 있다.

```ts
// interface Product {
//   id: number;
//   name: string;
//   price: number;
// }

interface Product {
  id: string;
  name: string;
  price: number;
}

function logProduct(product: Product) {
  const id: number = product.id;
  // ~~ Type 'string' is not assignable to type 'number'
  const name: string = product.name;
  const price: number = product.price;
  console.log(id, name, price);
}
```

logProduct의 경우 비구조화 할당문을 사용해 구현하는 것이 장점인 케이스이다. **비구조화 할당문은 모든 지역 변수의 타입이 추론되도록 한다.**

```ts
function logProduct(product: Product) {
  const { id, name, price } = product;
  console.log(id, name, price);
}
```

정보가 부족해서 타입스크립트가 스스로 타입을 추론하기 어려운 상황이 있다면, 그럴 때는 명시적으로 타입 구문이 필요하다. 타입스크립트는 매개변수의 최종 사용처까지 고려하지 않고 일반적으로 변수가 처음 등장할 때 결정된다.

일반적으로 타입스크립트 코드는 함수/메서드 시그니처에 타입 구문을 포함하지만, **함수 내에서 생성된 지역 변수에는 타입 구문을 넣지 않는다.** 이는 오히려 가독성에 방해가 된다.

추가적으로 함수의 매개변수에 기본값이 있다면 이는 매개변수에 타입 구문을 생략하고 타입을 추론할 수 있다.
또한, 타입 정보를 제공하는 라이브러리에서 콜백 함수의 매개변수 타입은 자동으로 추론되니 타입을 명시할 필요없다.

```ts
function parseNumber(str: string, base=10) {
  ...
}

app.get(..., (req: express.Request, res: express.Response) => {
  ...
}) // x


app.get(..., (req, res) => {
  ...
}) // o
```

객체 리터럴의 경우 타입이 추론되었지만, 명시를 해주고 싶은 몇 가지 상황 중 하나이다. **객체 정의에 타입을 명시하면 잉여 속성 체크가 동작하기 때문에 선택적 속성이 있는 타입의 오타 같은 오류를 잡는 데 효과적이다.** 변수가 사용되는 순간이 아닌 할당하는 시점에 오류가 표시될 수 있다. 만약, 타입이 명시되어 있지 않다면, 객체가 사용되는 곳에서 타입 오류가 발생한다.

```ts
const elmo: Product = {
  name: "Tickle Me Elmo",
  id: "048188 627152",
  price: 28.99,
};
```

```ts
interface Product {
  id: string;
  name: string;
  price: number;
}

function logProduct(product: Product) {
  const id: number = product.id;
  // ~~ Type 'string' is not assignable to type 'number'
  const name: string = product.name;
  const price: number = product.price;
  console.log(id, name, price);
}
const furby = {
  name: "Furby",
  id: 630509430963,
  price: 35,
};
logProduct(furby);
// ~~~~~ Argument .. is not assignable to parameter of type 'Product'
//         Types of property 'id' are incompatible
//         Type 'number' is not assignable to type 'string'
```

마찬가지로, **함수의 반환에도 타입을 명시하여 오류를 방지할 수 있다.** 코드상에서 의도된 반환 타입을 명시한다면, 정확한 위치에 오류를 표시할 수 있다. 추가적으로 함수의 반환 타입을 명시하면, 함수에 대해 더욱 명확하게 알 수 있기 때문이다. 반환 타입을 명시하려면 구현하기 전에 입출력 타입이 무엇인지 명확해야 된다. 함수 시그니처는 쉽게 변하지 않기 때문에 코드 변경에 안정성을 부여할 수 있다.

```ts
const cache: { [ticker: string]: number } = {};
function getQuote(ticker: string): Promise<number> {
  if (ticker in cache) {
    return cache[ticker];
    // ~~~~~~~~~~~~~ Type 'number' is not assignable to 'Promise<number>'
  }
  // COMPRESS
  return Promise.resolve(0);
  // END
}
```

**미리 타입을 명시하는 방법은 TDD 방식과 비슷하다. 전체 타입 시그니처를 먼저 작성하면 구현에 맞추어 주먹구구식으로 시그니처가 작성되는 것을 막을 수 있다.**

또한, 명명된 타입을 사용하기 위해 타입을 명시할 수도 있다. 가령 반환 타입이 명시되어 있지 않은 함수가 있다. 추론된 타입은 입력과 같이 Vector2D와 호환되지만, 입력이 Vector2D인데 반해 출력은 {x: number, y: number}로 추론되어 혼란스러울 수 있다.
즉, 추론된 타입이 직관적으로 파악하기 더 복잡하다면, 명명된 타입을 제공하는 것이 더 낫다.

```ts
interface Vector2D {
  x: number;
  y: number;
}
function add(a: Vector2D, b: Vector2D) {
  return { x: a.x + b.x, y: a.y + b.y };
}
```
