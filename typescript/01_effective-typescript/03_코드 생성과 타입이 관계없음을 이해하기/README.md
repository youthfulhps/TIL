# 아이템 3. 코드 생성과 타입이 관계없음을 이해하기

> 타입스크립트 컴파일러의 두 가지 역할은 서로 완벽히 독립적이다.

타입스크립트 컴파일러는 최신 타입스크립트/자바스크립트를 브라우저에서 동작할 수 있도록 구버전의 자바스크립트로 트랜스파일하며 코드의 타입 오류를 체크한다.

💬 여기서 중요한 점은 **이 두 가지가 서로 독립적**이라는 것입니다. 타입스크립트가 자바스크립트로 변환될 때 코드 내의 타입에는 영향을 주지 않습니다. 반대로, 자바스크립트의 실행 시점에도 타입은 영향을 미치지 않습니다.

> 타입 오류가 있는 코드도 컴파일이 가능하다.

💬 타입체커에게 지적을 받은 코드도 문법적 오류가 없다면 컴파일이 가능합니다. 타입 체크와 컴파일이 동시에 이루어지는 C나 자바 같은 언어와 비교했을 때, 타입체크의 지적은 C나 자바 같은 언어들의 경고와 비슷한 수준입니다.

```tsx
let x = "hello";
x = 1234;
```

```bash
~$ tsc main.ts

main.ts:2:1 -error ... '1234' 형식은 'string' 형식에 할당할 수 없습니다.
```

💬 코드의 오류가 있을 때 '컴파일에 문제가 있다' 라고 말하는 것은 기술적으로 틀린 말입니다. 엄밀히 말하면 오직 코드 생성만이 '컴파일'이라고 할 수 있기 때문에 작성한 타입스크립트가 유효한 자바스크립트라면 타입스크립트 컴파일러는 컴파일을 해냅니다. 즉, 타입스크립트 코드에 오류가 있을 때 '타입 체크에 문제가 있다' 고 표현하는 것이 더 정확합니다.

💬 타입 체크에 문제가 있지만, 컴파일이 수행되는 것을 보면 타입스크립트가 엉성한 언어처럼 보일 수 있으나 타입 체크의 오류 여부의 상관없이 컴파일된 산출물을 생성하는 것은 어플리케이션 운영 단계에서 실제로 도움이 됩니다.

> 런타임에는 타입 체크가 불가능하다.

타입스크립트의 타입은 '제거 가능' 하다. 실제로 자바스크립트로 컴파일되는 과정에서 모든 인터페이스, 타입, 타입 구문은 그냥 제거되어 버린다.

💬 아래와 같은 코드를 작성할 수 있습니다. `instanceof` 체크는 런타임에 일어나지만, `Rectangle`은 타입이기 때문에 런타임 시점에 아무런 역할을 할 수 없습니다.

```tsx
interface Square {
  width: number;
}

interface Rectangle extends Square {
  height: number;
}

type Shape = Square | Rectangle;

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) {
    //'Rectangle'은 형식만 참조하지만, 여기서는 값으로 사용되고 있습니다.
    return shape.width * shape * height;
  } else {
    return shape.width * shape.width;
  }
}
```

💬 앞의 코드에서 다루고 있는 `shape` 타입을 명확하게 하려면, 아래와 같은 두 가지 방법으로 런타임에 타입정보를 유지합니다. 속성의 존재 여부를 알아보는 방법과 런타임에 접근 가능한 타입 정보를 명시적으로 저장하는 '태그' 기법이 있습니다.

```tsx
...

function calculateArea(shape: Shape) {
	if ('height' in shape) {
		return shape.width * shape*height;
	} else {
		return shape.width * shape.width;
	}
}
```

```tsx
interface Square {
  kind: "square";
  width: number;
}

interface Rectangle extends Square {
  kind: "rectangle";
  height: number;
}

type Shape = Square | Rectangle;

function calculateArea(shape: Shape) {
  if (shape.kind === "rectangle") {
    //'Rectangle'은 형식만 참조하지만, 여기서는 값으로 사용되고 있습니다.
    return shape.width * shape * height;
  } else {
    return shape.width * shape.width;
  }
}
```

💬 런타임 시 접근 불가한 타입과 런타임 시 접근가능한 값을 둘 다 사용하는 기법도 존재합니다. 타입을 클래스로 만들면 됩니다.

```tsx
class Square {
  constructor(public width: number) {}
}

class Rectangle extends Square {
  constructor(public width: number, public height: number) {
    super(width);
  }
}

type Shape = Square | Rectangle;

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) {
    return shape.width * shape * height;
  } else {
    return shape.width * shape.width;
  }
}
```

> 타입 연산은 런타임에 영향을 주지 않는다

💬 타입 단언문 사용은 타입에 대한 확신이 있을 때만 사용해야 합니다. `string` 또는 `number` 타입인 값을 항상 `number`로 정제하는 경우를 가정해보겠습니다.

```tsx
function asNumber(value: number | string): number {
  return value as number;
}
```

💬 타입스크립트 컴파일러는 위와 같은 코드를 타입을 정제하는 과정이 없는 자바스크립트 코드를 생성합니다. 즉, 타입 연산은 런타임에 아무런 영향을 끼치지 않습니다.

```tsx
function asNumber(value) {
  return value;
}
```

💬 타입 단언은 타입체커의 지적을 피하기 위한 용도로 사용해서는 안됩니다. 값을 정제하기 위해서는 런타임의 타입 체크를 해야하고, 자바스크립트 연산을 통해 반환을 수행해야 합니다.

```tsx
function asNumber(value: number |. string): number {
	return typeof(value) === 'string' ? Number(value) : value
}
```

> 런타임 타입은 선언된 타입과 다를 수 있다.

💬 타입스크립트는 일반적으로 실행되지 못하는 죽은 코드를 찾아내지만, 아래의 경우 `strict`을 설정하더라도 찾아내지 못합니다. `value`가 `boolean` 타입으로 선언되어 있고 이는 런타임에 제거됩니다. 즉, 자바스크립트에서는 "ON" 이라는 `value`를 통해 `setLightSwitch`를 호출하면 default 케이스의 실행문이 동작합니다.

```tsx
function setLightSwitch(value: boolean) {
  switch (value) {
    case true:
      turnLightOn();
      break;
    case false:
      turnLightOff();
      break;
    default:
      console.log("실행되지 않을까 봐 걱정됩니다.");
  }
}
```

💬 순수 타입스크립트에서도 default 케이스의 실행문이 호출되는 방법이 존재합니다. /light를 요청하면 그 결과로 `LightApiResponse`를 반환하도록 선언되었습니다. 하지만 실제로 모든 경우에서 그렇게 되리라는 보장은 없습니다. 즉, `setLightSwitch`를 호출했을 때 default 케이스의 실행문이 동작할 수 있습니다.

```tsx
interface LightApiResponse {
  lightSwitchValue: boolean;
}

async function setLight() {
  const response = await fetch("/light");
  const result: LightApiResponse = await response.json();
  setLightSwitch(result.lightSwitchValue);
}
```

💬 결과적으로, 타입스크립트에서는 런타임 타입과 선언된 타입이 맞지 않을 수 있습니다. 타입이 달리지는 혼란스러운 상황을 가능한 한 피해야 하며 선언된 타입이 언제든지 달라질 수 있는 점을 명심해야 합니다.

> 타입스크립트 타입으로는 함수를 오버로드할 수 없다.

💬 C++과 같은 언어는 동일한 이름에 매개변수만 다른 여러 버전의 함수를 허용합니다. 이를 '함수 오버로딩' 이라고 합니다. 그러나, 타입스크립트에서는 타입과 런타임의 동작이 무관하기 때문에 함수 오버로딩은 불가능합니다.

```tsx
function add(a: number, b: number) {
  return a + b;
}
function add(a: string, b: string) {
  return a + b;
}
//중복된 함수 구현입니다.
```

💬 타입스크립트가 함수 오버로딩 기능을 지원하기는 하지만, 온전히 타입 수준에서만 동작합니다. 하나의 함수에 대해 여러 개의 선언문을 작성할 수 있지만, 구현채는 오직 하나입니다. 아래의 코드 처음 두 개의 선언문은 타입 정보를 제공할 뿐입니다. 이 두 선언문은 타입스크립트가 자바스크립트로 변환되면서 제거되며, 구현체만 남게 됩니다. (이런 스타일의 오버로딩을 사용하려면, 몇 가지 주의사항이 있습니다. 이후 자세히 다룹니다.)

```tsx
function add(a: number, b: number): number;
function add(a: string, b: string): string;

function add(a, b) {
  return a + b;
}

const three = add(1, 2);
const twelve = add("1", "2");
```

> 타입스크립트 타입은 런타임 성능에 영향을 주지 않는다.

💬 타입과 타입 연산자는 자바스크립트 변환 시점에 제거되기 때문에 런타임 성능에 아무런 영향을 주지 않습니다. 타입스크립트를 쓰는 대신 런타임 오버헤드를 감수하며 타입 체크를 해 본다면, 타입스크립트 팀이 다름 주의사항들을 얼마나 잘 테스트해 왔는지 몸소 느끼게 됩니다.

- '런타임' 오버헤드가 없는 대신, 타입스크립트 컴파일러는 '빌드타임' 오버헤드가 있다. 타입스크립트 팀은 컴파일러 성능을 매우 중요하게 생각한다. 오버헤드가 커지면, 빌드 도구에서 '트랜스파일만(transplie only)'를 설정하여 타입 체크를 건너뛸 수 있다.
- 타입스크립트가 컴파일하는 코드는 오래된 런타임 환경을 지원하기 위해 호환성을 높이고 성능 오버헤드를 감안할지, 호환성을 포기하고 성능 중심의 네이티브 구현체를 선택할지의 문제에 맞닥뜨릴 수도 있다. 어떤 경우든지 호환성과 성능 사이의 선택은 컴파일 타깃과 언어 레벨의 문제이며 여전히 타입과는 무관하다.
