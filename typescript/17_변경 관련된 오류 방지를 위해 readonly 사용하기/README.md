# 아이템17. 변경 관련된 오류 방지를 위해 readonly 사용하기

이 함수는 배열 안의 숫자들을 모두 합친다. 그런데 계산이 끝나면 원래 배열이 전부 비게 된다. 자바스크립트 배열은 내용을 변경할 수 있기 때문에 타입스크립트에서도 역시 오류 없이 통과하게 된다.

```ts
function arraySum(arr: number[]) {
  let sum = 0,
    num;
  while ((num = arr.pop()) !== undefined) {
    sum += num;
  }
  return sum;
}
```

오류의 범위를 좁히기 위해 arraySum이 배열을 변경하지 않는다는 선언을 할 수 있다.

```ts
function arraySum(arr: readonly number[]) {
  let sum = 0,
    num;
  while ((num = arr.pop()) !== undefined) {
    // ~~~ 'pop' does not exist on type 'readonly number[]'
    sum += num;
  }
  return sum;
}
```

`readonly number[]`는 타입이고 `number[]`와 구분되는 몇 가지 특징이 있다.

- 배열의 요소를 읽을 수 있지만, 쓸 수는 없다.
- length를 읽을 수 있지만, 바꿀 수는 없다.
- 배열을 변경하는 pop을 비롯하여 다른 메서드를 사용할 수 없다.

`number[]`는 `readonly number[]`보다 기능이 많기 때문에, `readonly number[]`의 서브타입이 된다. 따라서 변경가능한 배열을 readonly 배열에 할당할 수 있다. 하지만, 그 반대는 불가능하다.

```ts
const a: number[] = [1, 2, 3];
const b: readonly number[] = a;
const c: number[] = b;
// ~ Type 'readonly number[]' is 'readonly' and cannot be
//   assigned to the mutable type 'number[]'
```

타입 단언문 없이 readonly 접근제어자를 제거할 수 있디면, readonly는 쓸모없는 것이므로 여기서 오류가 발생하는 게 맞다.
매개변수를 readonly로 선언하면 다음과 같은 일이 생긴다.

- 타입스크립트는 매개변수가 함수 내에서 변경이 일어나는지 체크한다.
- 호출하는 쪽에서는 함수가 매개변수를 변경하지 않는다는 보장을 받게 된다.
- 호출하는 쪽에서 함수에 readonly 배열을 매개변수로 넣을 수도 있다.

자바스크립트, 타입스크립트 모두 명시적으로 언급하지 않는 한, 함수가 매개변수를 변경하지 않는다고 가정합니다. 그러나 이러한 암묵적인 방법은 타입 체크에 문제를 일으킬 수 있기 떄문에 명시적인 방법을 사용하는 것이 컴파일러와 사람에게 모두 좋다.

즉, 함수가 매개변수를 변경하지 않는다면 readonly로 선언해야 한다. 더 넓은 타입으로 호출할 수도 있고, 의도치 않은 변경이 방지될 수 있다.

readonly를 사용하면 지역 변수와 관련된 모든 종류의 변경 오류를 방지할 수 있다. 예를 들어 소설에 대한 다양한 처리를 하는 프로그램을 만든다고 가정했을 때 연속된 행을 가져와서 빈 줄을 기준으로 구분되는 단락으로 나누는 기능을 하는 프로그램에 대한 코드를 보자.

```ts
function parseTaggedText(lines: string[]): string[][] {
  const paragraphs: string[][] = [];
  const currPara: string[] = [];

  const addParagraph = () => {
    if (currPara.length) {
      paragraphs.push(currPara);
      currPara.length = 0; // Clear the lines
    }
  };

  for (const line of lines) {
    if (!line) {
      addParagraph();
    } else {
      currPara.push(line);
    }
  }
  addParagraph();
  return paragraphs;
}
```

하지만, 입력으로 소설을 넣고 실행하면 아래와 같은 출력이 된다. 이 코드의 문제점은 별칭과 변경을 동시에 사용해 발생했다.

```ts
[[], [], []];
```

별칭은 다음 행에서 발생한다. currPara의 내용이 삽입되지 않고 배열의 참조가 삽입되었다. currPara에 새 값을 채우거나 지운다면 동일한 객체를 참조하고 있는 paragraphs 요소에도 변경이 반영된다. 새 단락을 paragraphs에 삽입하고 바로 지워버린다.

```ts
paragraphs.push(currPara);
currPara.length = 0; // Clear the lines
```

currPara를 `readonly`로 선언하여 이런 동작을 방지할 수 있다. 선언을 바꾸는 즉시 코드 내에서 몇 가지 오류가 발생한다.

```ts
function parseTaggedText(lines: string[]): string[][] {
  const currPara: readonly string[] = [];
  const paragraphs: string[][] = [];

  const addParagraph = () => {
    if (currPara.length) {
      paragraphs.push(
        currPara
        // ~~~~~~~~ Type 'readonly string[]' is 'readonly' and
        //          cannot be assigned to the mutable type 'string[]'
      );
      currPara.length = 0; // Clear lines
      // ~~~~~~ Cannot assign to 'length' because it is a read-only
      // property
    }
  };

  for (const line of lines) {
    if (!line) {
      addParagraph();
    } else {
      currPara.push(line);
      // ~~~~ Property 'push' does not exist on type 'readonly string[]'
    }
  }
  addParagraph();
  return paragraphs;
}
```

currPara를 `let`으로 선언하고, 변환이 없는 메서드를 사용하여 두 개의 오류를 고칠 수 있다. const에서 let으로 바꾸고 `readonly`를 추가함으로써 한쪽의 변경 가능성을 또 다른 쪽으로 옮겼다. currPara 변수는 이제 가리키는 배열을 자유롭게 변경할 수 있지만, 그 배열 자체를 변경하는 것은 불가능하다. (재할당 가능 그러나, 배열 자체에 대한 변경은 불가능)

```ts
let currPara: readonly string[] = [];
//...
currPara = []; //배열을 비움
//...
currPara = currPara.concat([line]);
```

하지만, 여전히 paragraphs에 대한 오류는 남아있다. 이 오류는 다음과 같은 방법들로 해결할 수 있다.

- currPara의 복사본을 만든다. currPara는 `readonly`로 유지되지만, 복사본은 변경이 가능하다.

```ts
paragraphs.push([...currPara]);
```

- paragraphs와 함수 반환 타입을 `readonly string[]`의 배열로 변경한다. 여기서 괄호가 중요하다.

```ts
const paragraphs: (readonly string[])[] = [];
```

- 배열의 `readonly` 속성을 제거하기 위해 단언문을 사용한다.

```ts
paragraphs.push(currPara as string[]);
```

`readonly`는 얕게 (shallow) 동작한다는 것을 유의하며 사용해야 한다. 앞에서 이미 `readonly string[][]`을 보았을 때 만약 객체의 `readonly` 배열이 있다면, 그 객체 자체는 `readonly`가 아니다.

```ts
const dates: readonly Date[] = [new Date()];
dates.push(new Date());
// ~~~~ Property 'push' does not exist on type 'readonly Date[]'
dates[0].setFullYear(2037); // OK
```

비슷한 경우 `readonly`의 사촌 격이자 객체에 사용되는 `Readonly` 제너릭에도 해당된다.

```ts
interface Outer {
  inner: {
    x: number;
  };
}
const o: Readonly<Outer> = { inner: { x: 0 } };
o.inner = { x: 1 };
// ~~~~ Cannot assign to 'inner' because it is a read-only property
o.inner.x = 1; // OK
```

현재 시점에서는 깊은 (deep) readonly 타입이 기본으로 지원되지 않지만, 제너릭을 만들면 깊은 readonly 타입을 사용할 수 있다.
그러나 제너릭은 만들기 까다롭기 때문에 라이브러리를 사용하는 게 낫다. _ts-essential_ 에는 `DeepReadonly`가 구현되어 있다.

추가적으로 인덱스 시그니처에도 `readonly`를 사용할 수 있다.

```ts
let obj: { readonly [k: string]: number } = {};
// Or Readonly<{[k: string]: number}
obj.hi = 45;
//  ~~ Index signature in type ... only permits reading
obj = { ...obj, hi: 12 }; // OK
obj = { ...obj, bye: 34 }; // OK
```
