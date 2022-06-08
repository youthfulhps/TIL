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
