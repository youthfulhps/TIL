# 아이템49. 콜백에서 this에 대한 타입 제공하기

자바스크립트에서 this 키워드는 매우 혼란스러운 기능 중 하나이다.
자바스크립트의 this는 다이나믹 스코프, 즉 `호출된` 방식에 따라 참조가 달라진다.

this는 전형적으로 객체의 현재 인스턴스를 참조하는 클래스에서 많이 사용된다.

```js
class C {
  vals = [1, 2, 3];
  logSquares() {
    for (const val of this.vals) {
      console.log(val * val);
    }
  }
}

const c = new C();
c.logSquares();
```

위 코드는 `1 4 9` 를 순서대로 출력한다. 여기서 `logSquares`를 외부 변수에
넣고 호출하면 `vals` 속성을 읽을 수 없어 런타임 에러가 발생한다.

```js
const c = new C();
const method = c.logSquares;
method();
```

`c.logSquares()`는 `C.prototype.logSquares`를 호출하고, this값을 `c`에 바인딩하는 과정을 거친다.
`method`라는 참조 변수를 사용함으로서 두 가지 작업이 분리되어 this의 값은 `undefined`이 된 것이다.

this를 명시적으로 바인딩하여 제어할 수 있도록 `call`을 사용할 수 있다.

```js
const c = new C();
const method = c.logSquares;
method.call(c);
```

this에는 어떤 것이든 바인딩할 수 있다. 라이브러리들도 API 일부에서 this 값을
사용할 수 있게 하며 심지어 DOM에서도 this를 바인딩할 수 있다.
이벤트 핸들러가 그 예시이다.

```js
document.querySelector('input')!.addEventListener('change', function(e) {
  console.log(this);  // Logs the input element on which the event fired.
});
```

this 바인딩은 종종 콜백 함수에서 사용되며 클래스 내에 onClick 핸들러를 정의한다면 다음과 같이 할 수 있다.

```ts
declare function makeButton(props: { text: string; onClick: () => void }): void;
class ResetButton {
  render() {
    return makeButton({ text: "Reset", onClick: this.onClick });
  }
  onClick() {
    alert(`Reset ${this}`);
  }
}
```

그러나, `ResetButton` 에서 `onClick`을 호출하면, 경고가 발생하기 때문에 이럴 때
생성 단계에서 바인딩을 해주는 것이 일반적인 해결책이다.

```ts
declare function makeButton(props: { text: string; onClick: () => void }): void;
class ResetButton {
  constructor() {
    this.onClick = this.onClick.bind(this);
  }
  render() {
    return makeButton({ text: "Reset", onClick: this.onClick });
  }
  onClick() {
    alert(`Reset ${this}`);
  }
}
```

사실, 더 편리한 해결책은 onClick을 화살표 함수로 정의하는 것이다. 화살표 함수로 바꾸면
`ResetButton`이 생성될 때마다 제대로 바인딩된 this를 가지는 새 함수를 생성하게 된다.

```ts
declare function makeButton(props: { text: string; onClick: () => void }): void;
class ResetButton {
  render() {
    return makeButton({ text: "Reset", onClick: this.onClick });
  }
  onClick = () => {
    alert(`Reset ${this}`); // "this" always refers to the ResetButton instance.
  };
}
```

만약 콜백함수에서 this를 사용해야 한다면, 타입 정보를 명시해주어야 한다.
콜백 함수의 매개변수에 this를 추가하면 this 바인딩이 체크되기 때문에 실수를 방지할 수 있을 뿐더러,
라이브러리 사용자의 콜백 함수에서 this를 참조할 수 있고 완전한 타입 안정성을 얻을 수도 있다.

```ts
declare function makeButton(props: { text: string; onClick: () => void }): void;
function addKeyListener(
  el: HTMLElement,
  fn: (this: HTMLElement, e: KeyboardEvent) => void
) {
  el.addEventListener("keydown", (e) => {
    fn(e);
    // ~~~~~ The 'this' context of type 'void' is not assignable
    //       to method's 'this' of type 'HTMLElement'
  });
}
class Foo {
  registerHandler(el: HTMLElement) {
    addKeyListener(el, (e) => {
      this.innerHTML;
      // ~~~~~~~~~ Property 'innerHTML' does not exist on type 'Foo'
    });
  }
}
```
