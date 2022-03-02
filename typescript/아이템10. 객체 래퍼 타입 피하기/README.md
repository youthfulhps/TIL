# 아이템 10. 객체 래퍼 타입 피하기

> 타입스크립트의 심벌(symbol)은 타입 공간이나 값 공간 중의 한 곳에 존재한다.

---

💬 자바스크립트에는 객체 이외에도 기본형 값들에 대한 일곱 가지 타입( `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint` )가 있다.기본형들은 불변이며 메서드를 가지지 않는다는 점에서 객체와 구분된다. 그런데, 기본형인
string의 경우 메서드를 가지고 있는 것처럼 보인다.

```ts
"primitive".charAt(3);
//"m"
```

💬 하지만 charAt은 string 메서드가 아니다. 자바스크립트는 기본형과 객체 타입을 서로 자유롭게 변환한다. **기본형에서 charAt에 접근할 때 자바스크립트는 기본형을 String 객체로 래핑하고, 메서드를 호출하고, 마지막에 래핑한 객체를 버린다.**

💬 만약 String.prototype을 [몽키 패치](https://en.wikipedia.org/wiki/Monkey_patch) 한다면 앞서 설명한 내부적인 동작들을 관찰할 수 있다.

```js
const originalCharAt = String.prototype.charAt;
String.prototype.charAt = function (pos) {
  console.log(this, typeof this, pos);
  return originalCharAt.call(this, pos);
};
console.log("primitive".charAt(3));

//[String: 'primitive'] Object 3
//m
```

💬 메서드 내의 this는 string 기본형이 아닌 String 객체 래퍼임을 확인 할 수 있다. 그러나, string 기본형과 String 객체 래퍼가 항상 동일하게 동작하는 것은 아니다. 예를 들어, String 객체는 오직 자기 자신하고만 동일하다.

```bash
"hello" === new String("hello") //false
new String("hello") === new String("hello") //false
```

💬 객체 래퍼 타입의 자동 변환은 종종 당황스러운 동작을 보일 때도 있다. 가령, 어떤 속성을 기본형에 할당하면 그 속성은 사라진다. 실제로는 x가 String 객체로 변환되고, language 속성이 추가되었고, language 속성이 추가된 객체는 버려졌다.

```bash
x = "hello"
x.language = "English"
x.language; //undefined
```

💬 `null과` `undefined`를 제외하고 다른 기본형 또한 동일하게 객체 래퍼 타입이 존재한다. 이러한 래퍼 타입들 덕분에 기본형 값에 메서드를 사용할 수 있고, 정적 메서드 또한 참조하여 사용할 수 있다.

💬 그런데, `string`을 사용할 때는 특히 유의해야 한다. `string`을 `String`이라고 잘못 타이핑하기 쉽고, 실수를 하더라도 처음에는 잘 동작하는 것처럼 보이기 때문이다.

```ts
function getStringLen(foo: String) {
  return foo.length;
}

getStringLen("hello"); // OK
getStringLen(new String("hello")); // OK
```

```ts
function isGreeting(phrase: String) {
  return ["hello", "good day"].includes(phrase);
  // ~~~~~~
  // Argument of type 'String' is not assignable to parameter
  // of type 'string'.
  // 'string' is a primitive, but 'String' is a wrapper object;
  // prefer using 'string' when possible
}
```

💬 string은 String에 할당할 수 있다. 하지만, String은 string에 할당할 수 없다. 타입스크립트가 제공하는 타입 선언은 전부 기본형 타입으로 되어 있다.

- 기본형 값에 메서드를 제공하기 위해 객체 래퍼 타입이 어떻게 쓰이는 지 이해해야 하고, 이를 직접 사용하거나 인스턴스를 생성하는 것은 피해야 한다.

- 타입스크립트 객체 래퍼 타입은 지양하고, 기본형 타입을 사용해야 한다.
