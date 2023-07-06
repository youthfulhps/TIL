# satisfies

타입스크립트 4.9 버전에 새옵게 추가된 연산자.

```ts
const palette = {
    red: [255, 0, 0],
    green: "#00ff00",
    bleu: [0, 0, 255], // blue 오타
};
```

다음과 같이 `palette` 객체를 선언했는데, `blue`의 오타를 잡아내기는 힘들기 때문에 객체 타입을 조금 더 제한(좁힌다.)한다.

```ts
const palette: Record<'red' | 'green' | 'blue', [number, number, number] | string> = {
    red: [255, 0, 0],
    green: "#00ff00",
    bleu: [0, 0, 255], 
    // ^^^
    // Object literal may only specify known properties, and 'bleu' does not exist in type 'Record<"red" | "green" | "blue", string | [number, number, number]>'.
};
```

위와 같이 타입이 좁혀진 `palette`는 `blue`의 오타를 쉽게 잡아낸다. 반면, 각각의 프로퍼티의 타입을 
`[number, number, number] | string` 로 `green` 프로퍼티 입장에서는 `string` 타입 혹은 `"#00ff00"` 
리터럴 타입으로 확실히 좁혀질 수 있었지만, `[number, number, number]`가 유니온되어 오히려 타입이 넓어지게 되고,
외부에서 `palette` 속성 중 `green`을 어디선가 사용하는 경우 다음과 같은 문제가 발생한다.

```ts
const uppercasedGreen = palette.green.toUpperCase();
// property toUpperCase does not exist on type [number, number, number]
```

`satisfies`는 타입스크립트의 추론 기능에 따라 객체의 가장 좁은 타입을 유지하면서, 키 값의 오타를 잡을 수 있는 기능을 제공한다.

```ts
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  bleu: [0, 0, 255], // blue 오타
} satisfies Record<'red' | 'green' | 'blue', [number, number, number] | string>;


// const palette1: {
//   red: [number, number, number];
//   green: string;
//   blue: [number, number, number];
// }
```

위와 같이, `blue`의 오타 또한 잡아내면서, `palette` 프로퍼티 각각의 타입 또한 훌륭하게 추론해내며 위에서 언급한 문제 또한
사라진다.

```ts
const uppercasedGreen = palette.green.toUpperCase()
// const uppercasedGreen: string
```


