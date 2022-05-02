# 아이템43. 몽키 패치보다는 안전한 타입을 사용하기

자바스크립트는 객체와 클래스에 임의의 속성을 추가할 수 있을 만큼 유연하다. 종종 window나 document에
값을 할당하여 전역 변수를 만들거나, DOM 엘리먼트에 데이터를 추가하기 위해서도 사용된다.

```ts
window.monkey = "Tamarin";
document.monkey = "Howler";
```

```ts
const el = document.getElementById("colobus");
el.home = "tree";
```

하지만, 사실 객체에 임의의 속성을 추가하는 것은 일반적으로 좋은 설계는 아니다. 예를 들어 window 또는 DOM 노드에
데이터를 추가한다고 가정한다면 그 데이터는 기본적으로 전역변수가 되어 은연중에 프로그램 내에서 의존성을 만들어내게 된다.

또한, 프로토타입에도 속성을 추가할 수 있기 때문에 이상한 결과를 마주하게 되는 경우도 생긴다.

```ts
> RegExp.prototype.monkey = 'Capuchin';
'Capuchin'
> /123/.monkey
'Capuchin'
```

여기서 타입스크립트까지 더하면 다른 문제가 발생하는데, 타입 체커는 Document와 HTMLElement의 속성에 대해서는
알고 있지만, 임의로 추가한 속성에 대해서는 알지 못한다.

```ts
document.monkey = "Tamarin";
// ~~~~~~ Property 'monkey' does not exist on type 'Document'
```

단언문을 사용하여 임의로 오류를 해결할 수 있지만, 최선의 해결책은 document 또는 DOM으로부터
데이터를 분리하는 것이다. 분리할 수 없는 경우 두 가지 차선책이 존재한다.

**첫 번째는 interface의 보강 기법을 사용하는 것이다.** 보강을 사용하는 것이 any를 사용하는 것보다 나은데,
타입이 더 안전하며, 타입 체커는 오타나 잘못된 타입의 할당을 오류로 표시하고,
속성의 주석과 자동완성을 사용할 수 있으며, 몽키 패치가 어떤 부분에 적용되었는지 정확한 기록이 남는다.

그리고, 모듈 관점에서 제대로 동작하게 하려면 global 선언을 추가해야 한다.

```ts
export {};
declare global {
  interface Document {
    /** Genus or species of monkey patch */
    monkey: string;
  }
}
document.monkey = "Tamarin"; // OK
```

보강을 사용할 때 주의해야 할 점은 모듈 영역과 관련있다. 보강은 전역적으로 적용되기 때문에,
코드의 다른 부분이나 라이브러리로부터 분리할 수 없다. 또한, 애플리케이션이 실행되는 동안
속성을 할당하면 보강을 적용할 방법이 없으며, 특히 웹 페이지 내의 HTML 엘리먼트를 조작할 때,
어떤 엘리먼트는 속성이 있고, 어떤 엘리먼트는 속성이 없는 경우도 문제가 된다.

**두 번째는, 더 구체적인 타입 단언문을 사용하는 것이다.** MonkeyDocument는 Document를 확장하기 때문에
타입 단언문은 정상이며 타입은 안전하다. 또한 Document 타입을 건드리지 않고, 별도로 확장하는 새로운 타입을 도입했기 때문에
모듈 영역 문제도 해결할 수 있다. 따라서 몽키패치된 속성을 참조하는 경우에만 단언문을 사용하거나 새로운 변수를 도입하면 된다.
그러나, 절대 남용해서는 안되며 더 잘 설계된 구조로 리팩터링하는 것이 좋다.
