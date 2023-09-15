## 데이터 타입

### 원시 타입

원시 타입은 변경 불가능한 값이며, pass-by-value (값에 의한 전달) 이다. Number, String, Boolean, undefined, null + Symbol 이 있고,
그 자체가 하나의 값을 가리키기 때문에 더이상 단순화할 수 없다.

1. Number, 자바스크립트에서 숫자를 나타내는 값의 타입은 하나이다. 실수, 정수 표현을 따로 구분짓지 않는다. 다만, Number의 정수 범위는 2**53 - 1(8바이트)
까지 담을 수 있으며 (-9007199254740991 ~ 9007199254740991) 16자리부터는 담지 못하는 숫자들이 존재한다. Number의 범위를 넘어가는 경우 BigInt를
사용해야 한다.

2. undefined vs null, 둘다 값이 부재한 것을 표현하기 위한 타입이며 해당 타입을 가지는 유일한 값이다. 그러나 일반적으로 undefined의 경우 선언과 초기화에 
의해 해당 변수에 대한 공간 메모리를 확보하였으나 아직 할당되지 않았을 때 자바스크립트 엔진 자체에서 할당한다. null의 경우 코드 작성자가 명시적으로 값의 부재함을 
표현하기 위한 값으로 사용된다.

    - 추가적으로 null은 함수가 호출되었으나 유효한 값을 반환할 수 없는 경우, 명시적으로 null을 반환하기도 한다. (ex. querySelector)
    - `typeof null === null`은 false이다. `typeof null`은 `object`로 이는 설계의 결함으로 알려져 있다. 따라서 null 여부를 비교하고자 한다면
   `===` 연산자를 사용해야 한다.

3. Symbol은 ES6에서 새롭게 추가된 데이터 타입이다. 심볼은 주로 이름의 충돌 위험이 없는 유일한 객체의 프로퍼티 키를 만들기 위해 사용된다. 심볼은 함수 호출로
생성되며, 생성된 심볼은 다른 심볼값들과는 다른 유일한 심볼이 된다.
```js
// 심볼 key는 이름의 충돌 위험이 없는 유일한 객체의 프로퍼티 키
var key = Symbol('key');
console.log(typeof key); // symbol

var obj = {};
obj[key] = 'value';
console.log(obj[key]); // value

var key2 = Symbol('key');

console.log(key === key2); // false;
```

### 객체(참조) 타입

객체는 이름과 값을 가지는 데이터를 의미하는 프로퍼티와 동작을 의미하는 메서드를 포함할 수 있는 독립적인 주체이다. 자바스크립트는 객체 기반의 스크립트 언어로
원시값을 제외한 거의 모든 것이 객체이다. pass-by-reference 방식으로 동작한다.

객체의 값이 수정되면, 새로운 객체가 만들어지고 다른 메모리에 할당하는 것이 아닌, 객체 내부의 프로퍼티 변수가 가리키고 있는 데이터 영역의 주소를 변경한다.


### pass-by-value vs pass-by-reference

**참조 타입은 객체의 모든 연산이 실제값이 아닌 참조값**으로 처리된다. 원시 타입은 한번 값이 결정되면 변경할 수 없지만, 객체는 프로퍼티를 변경, 추가, 삭제가 가능하다.
객체 타입은 동적으로 변화하기 때문에 어느 정도의 메모리를 확보해야 하는지 불명확하여 런타임에 메모리를 확보하고 힙 영역에 저장된다. 
반대로, **원시타입은 값으로 전달된다. 즉, 복사되어 값이 전달된다.** 또한 값에 대한 메모리 공간이 고정적이기 때문에 런타임에 메모리의 스택 영역에 고정 점유한다.

```js
// Pass-by-reference
var foo = {
  val: 10
}

var bar = foo;
console.log(foo.val, bar.val); // 10 10
console.log(foo === bar);      // true

bar.val = 20;
console.log(foo.val, bar.val); // 20 20
console.log(foo === bar);      // true
```

bar 변수에 foo가 할당되었다. 이는 값이 복사되어 bar이 가리키는 메모리 영역에 할당된 것이 아니라, foo가 가리키는 메모리 영역을 공유한 것이다. 따라서 bal의 
val 프로퍼티값을 수정했지만, foo의 var 또한 수정된다. 

```js
// Pass-by-value
var a = 1;
var b = a;

console.log(a, b);    // 1  1
console.log(a === b); // true

a = 10;
console.log(a, b);    // 1  10
console.log(a === b); // false
```

b 변수에 a가 할당되었다. 이는 값이 복사되어 b가 가리키는 새로운 메모리 영역에 a의 값인 1이 할당된다. 즉 a, b는 다르다.



