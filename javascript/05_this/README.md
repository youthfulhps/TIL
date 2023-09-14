## this

### TL;DR

1. 함수가 new 키워드와 함께 생성자 함수로 사용될 경우, new 키워드로 인해 새롭게 생성된 객체에 this가 바인딩된다.
2. apply, call, bind 함수의 호출/생성에 사용되는 경우, 함수 내의 this는 인수로 전달된 객체가 된다. (인위적 할당)
3. 객체의 메서드로서 함수가 호출된 경우 this는 자신(메서드)를 소유한 객체가 된다.
4. 함수가 자유 함수로 호출되는 경우 (1, 2, 3 외의 방법으로 호출)되는 경우 this는 전역 객체이다. (엄격 모드에서는 undefined)
   - 중첩 구조를 가진 외부 함수의 내부 함수, 콜백함수 또한 전역 객체에 바인딩된다.
5. 화살표 함수의 경우, 위 규칙을 무시하고 언제나 상위 스코프를 가리키는데, 이를 렉시컬 this라 한다.

this는 자신을 가리키는 참조변수이며, 자바스크립트의 this는 함수가 어떻게 호출되었느냐에 따라 동적으로 결정된다. 

### 함수 호출

전역 객체는 모든 객체의 유일한 최상위 객체이다. 브라우저의 경우 `window`, 서버의 경우 `global` 객체를 의미한다.
전역 객체는 전역 스코프를 갖는 전역 변수를 프로퍼티로 소유한다. 글로벌 영역에서 선언된 함수의 경우 전역 객체의 프로퍼티로
접근할 수 있는 전역 변수의 메서드이다. 

```js
// browser
this === window

// server (node.js)
this === global
```

**기본적으로 `this`는 전역 객체에 바인딩되는데 추가적으로 다음과 같은 케이스 또한 전역 객체에 바인딩된다.**

중첩된 함수 구조를 가진,
1. 내부 함수
2. 메서드의 내부 함수
3. 콜백 함수

```js
function a() {
  console.log(this) // window
  function b() {
    console.log(this) // window
  }
}

var obj = {
  a: function () {
    console.log(this) // window
    function b() {
      console.log(this) // window
    }
  }
}

var obj = {
  a: function () {
    setTimeout(function b() {
      console.log(this) // window
    }, 100)
  }
}
```

**즉, 내부 함수는 일반 함수, 메서드, 콜백 함수 어디에서 선언되었는지 관계없이 this는 전역 객체에 바인딩된다.

### 메서드 호출

**함수가 객체의 프로퍼티 값이면 메서드로서 호출된다. 이때 `this`는 해당 메서드를 소유한 객체가 바인딩된다.**
프로토타입 객체도 메서드를 가질 수 있는데, 프로토타입 객체 메서드 내부에서 사용된 `this`도 일반 메서드 방식과
동일하게 해당 메서드를 호출한 객체에 바인딩된다.

```js
var obj1 = {
  name: 'Lee',
   sayName: function () {
    console.log(this.name);
   }
}

var obj2 = {
  name: 'Kim',
}

obj2.sayName = obj1.sayName;

obj1.sayName(); // Lee
obj2.sayName(); // Kim

function Person(name) {
  this.name = name;
}

Person.prototype.getName = function () {
  return this.name;
}

var me = new Person('Lee');
console.log(me.getName());

Person.prototype.name = 'Kim';
console.log(Person.prototype.getName());
```

### 생성자 함수 호출

기존 함수에 new 연산자를 붙여 호출한 해당 함수는 생성자 함수로 동작한다. 생성자 함수로 호출된 함수는 this 바인딩이 다르게 동작하게 되는데,
new 연산자와 함께 생성자 함수를 호출하면 다음과 같은 순서로 동작한다.

1. 빈객체 생성 및 바인딩, 생성자 함수의 코드가 실행되기 전에 new 키워드를 통해 빈 객체가 생성된다. 이후 생성자 함수 내에서 사용되는 `this`
는 생성된 빈 객체를 가리키게 된다. 추가적으로 생성자 함수의 prototype 프로퍼티가 가리키는 객체를 자신의 프로토타입 객체로 설정한다.
2. `this`를 통한 프로퍼티 생성, 생성된 빈 객체에 `this`를 사용하여 동적으로 프로퍼티와 메서드를 생성할 수 있다. `this`는 새로 생성된
객체를 가리키므로 this를 통해 생성한 프로퍼티와 메서드는 새로 생성된 객체에 추가된다.
3. 생성된 객체 반환, 반환문이 없는 경우 this에 바인딩된 새로 생성된 객체가 반환된다. (명시적으로 this를 반환하여도 동일),
반환문이 this가 아닌 다른 객체를 명시적으로 반환하는 경우, this가 아닌 해당 객체가 반환된다. (해당 방식은 생성자 함수로서의 역할이 잠식되는
동작이기 때문에 생성자 함수에서는 명시적으로 반환문을 사용하지 않는다.)

```js
function Person(name) {
  // 생성자 함수 코드 실행 전 -------- 1
  this.name = name;  // --------- 2
  // 생성된 함수 반환 -------------- 3
}

var me = new Person('Lee');
console.log(me.name); // Lee
```

### apply, call, bind 호출

위처럼 자바스크립트 엔진에 의해 동적으로 할당되는 this와는 달리, 명시적으로 바인딩할 수 있는 방법을 제공한다.

```js
func.apply(thisArg, [argsArray])

// thisArg, 함수 내부의 this에 바인딩할 객체
// argsArray, 함수에 전달할 argument의 배열
```

call과 apply의 기능은 동일하지만, apply는 배열 형태로, call은 하나씩 넘긴다.

```js
Person.apply(foo, [1, 2, 3]);
Person.call(foo, 1, 2, 3);
```

bind의 경우 ES5에 추가되었다. 함수에 인자로 전달한 this가 바인딩된 새로운 함수를 반환한다. 즉, apply, call과의 차이점은 바로 함수가
호출되는 것이 아닌 함수를 반환받는다는 점이다.












