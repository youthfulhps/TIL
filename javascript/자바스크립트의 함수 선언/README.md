# 자바스크립트 함수 선언

### 자바스크립트의 함수는 일급 객체이다

**자바스크립트의 함수는 일급 객체이다**. 이로서 같은 특징은 무명의 리터럴로 표현가능하며, 변수나 자료 구조(객체, 배열)에 저장될 수 있고, 함수의 파라미터로 전달, 반환값으로 사용될 수 있다. **자바스크립트의 함수는 다양한 방식으로 선언될 수 있다.**

함수의 작업 실행을 위해 추가적인 정보가 필요한 경우 매개변수를 지정하여 사용한다. 매개변수는 함수 내에서 변수와 동일하게 동작하며 변수와 동일한 메모리 공간을 확보하여 전달받은 인수를 매개변수에 할당한다. 만약, 인수가 없다면 매개변수는 undefined로 초기화된다.

### 인수의 Call-by-value vs. Call-by-reference

원시 타입 인수는 call-by-value 로 동작한다. 즉, 함수 호출 시 전달받은 인수를 매개변수에 할당할 때 인수의 값을 복사하여 매개변수로 전달된다. 즉, 함수의 동작에 의해 전달받은 원시 타입 값은 변경되지 않는다.

반래도, 객체형(참조형) 인수는 Call-by-reference 로 동작한다. 인수를 매개변수에 할당할 때 인수의 참조값을 매개변수에 저장한다. 즉, 함수의 동작에 의해 전달받은 참조형 인수값 또한 변경된다.

함수의 동작에 의해 특정 외부 상태가 변경되는 부수 효과 (side-effect)를 발생시키는 함수를 비순수 함수, 어떤 외부 상태도 변경하지 않는 함수를 순수 함수라 한다.

### 함수 객체의 프로퍼티

함수는 객체이다. 즉, 함수는 프로퍼티를 소유할 수 있다.

```jsx
function square(number) {
  return number * number;
}

square.x = 10;
square.y = 20;

console.log(square.x, square.y);
```

**arguments 객체 프로퍼티**는 함수 호출 시 전달된 인수들의 정보를 담고 있으며 이터러블 유사 배열 객체이며, 함수 내부에서 지역변수처럼 사용된다. 매개변수 갯수 대비 인수가 적을 때 인수가 전달되지 않은 매개변수는 `undefined`로 초기화되며 많을 때는 초과된 인수를 무시한다.

```jsx
function multiply(x, y) {
  console.log(arguments);
  return x * y;
}

multiply(); // {}
multiply(1); // { '0': 1 }
multiply(1, 2); // { '0': 1, '1': 2 }
multiply(1, 2, 3); // { '0': 1, '1': 2, '2': 3 }
```

arguments 객체는 가변 인자 함수를 구현할 때 유용하다.

```jsx
function sum() {
  var res = 0;

  for (var i = 0; i < arguments.length; i++) {
    res += arguments[i];
  }

  return res;
}

console.log(sum()); // 0
console.log(sum(1, 2)); // 3
console.log(sum(1, 2, 3)); // 6
```

```jsx
//Call-by-value
function foo(primitive) {
  primitive += 1;
  return primitive;
}

var x = 0;

console.log(foo(x)); // 1
console.log(x); // 0

//Call-by-reference
function changeVal(primitive, obj) {
  primitive += 100;
  obj.name = "Kim";
  obj.gender = "female";
}

var num = 100;
var obj = {
  name: "Lee",
  gender: "male",
};

console.log(num); // 100
console.log(obj); // Object {name: 'Lee', gender: 'male'}

changeVal(num, obj);

console.log(num); // 100
console.log(obj); // Object {name: 'Kim', gender: 'female'}
```

### 함수 선언문

함수 선언문 방식으로 정의한 함수는 function 키워드와 함께 함수명, 매개변수 목록, 함수 몸체로 된다.

```jsx
function sayHello(name) {
  console.log("hello", name);
  return name;
}
```

### 함수 표현식

자바스크립트의 함수는 일급 객체라는 특성에 입각하여 함수 리터럴 방식으로 함수를 정의하고 변수에 할당할 수 있다. 함수 표현식에서는 일반적으로 함수명을 생략한다. 이를 **익명함수(anonymous function)** 라 한다.

```jsx
var sayHello = function (name) {
  console.log("hello", name);
  return name;
};
```

물론, 기명 혹은 명명 함수 표현식으로서 함수명을 포함하는 함수 표현식 또한 가능하다.

```jsx
var hello = function sayHello(name) {
  console.log("hello", name);
  return name;
};
```

함수는 일급객체이기 때문에 변수에 할당할 수 있는데, 이 변수는 함수명이 아니라 할당된 함수를 가리키는 참조값을 갖게 된다. 즉, 함수 호출시 함수명이 아니라 함수를 가리키는 변수명을 사용해야 한다. 아래의 변수 bar, foo는 동일한 익명 함수의 참조값을 갖는다.

```jsx
var foo = function (a, b) {
  return a * b;
};

var bar = foo;

console.log(foo(10, 10)); // 100
console.log(bar(10, 10)); // 100
```

**만약, 함수가 할당된 변수가 아닌 기명 함수의 함수명으로 함수를 호출하게 되면 에러가 발생한다. 함수 표현식에서 사용한 함수명은 외부 코드에서 접근이 불가능하기 때문이다.**

사실 함수 선언문 또한 마찬가지로 에러가 발생하는 것이 맞지만, **우리가 함수 선언문으로 선언된 함수를 함수명으로 호출할 수 있는 것은 자바스크립트 엔진에서 함수 선언문을 아래와 같이 형태를 변경시키기 때문이다.** 결국, 함수 선언문도 함수 표현식과 동일하게 함수 리터럴 방식으로 정의되는 것이다.

```jsx
function sayHello(name) {
	console.log('hello', name);
	return name;
}

=>

var sayHello = function sayHello(name) {
	console.log('hello', name);
	return name;
}
```

### Function 생성자 함수

위의 내용을 잠시 정리하자면, 함수 선언문과 함수 표현식은 결국 자바스크립트 엔진에 의해 모두 함수 리터럴 방식으로 함수를 정의된다. 이것은 결국 **내장 함수 Function 생성자 함수로 함수를 생성하는 것을 단순화시킨 축약법이다.**

Function 생성자 함수는 Function.prototype.constructor 프로퍼티로 접근할 수 있고, Function 생성자 함수로 함수를 생성하는 문법은 다음과 같다.

```jsx
new Function(arg1, arg2, ...,argN, functionBody);
```

```jsx
var square = new Function("number", "return number * number");
console.log(square(10));
```

### 화살표 함수

ES6에 새롭게 추가된 화살표 함수는 function 키워드를 대신하여 화살표 ( ⇒ ) 를 사용한다. 이는 함수를 보다 간략하게 선언할 수 있다. 화살표 함수는 익명 함수로만 사용할 수 있다. 그러므로 화살표 함수를 호출은 함수 표현식을 통해 이루어진다.

```jsx
const square = (number) => number * number;
```

```jsx
const arr = [1, 2, 3];
const square = arr.map((i) => i * i);
```

### 함수 호이스팅에 대해서

함수 선언식, 함수 표현식, Function 생성자 함수를 사용하여 함수를 선언할 수 있었다. 결국 Function 생성자 함수를 통해 함수를 생성하는 것이다. 하지만, 3가지 함수 정의 방식에 따른 동작 방식이 약간 차이가 있다.

**함수 선언문은 함수 표현식과는 다르게 호이스팅된다.** 즉, 함수의 선언 위치에 상관없이 코드 내 어느곳에서든지 호출이 가능한데, 이것을 **함수 호이스팅**이라 한다.

함수 선언문으로 정의된 함수는 자바스크립트 엔진에 의해 스크립트가 로딩되는 시점에 이를 변수 객체에 저장하는데, 함수가 선언됨과 동시에 초기화, 할당 또한 이루어진다. 그렇기 때문에 함수가 어느 곳에서든 호출이 가능하다.

반대로, 함수 표현식은 함수 호이스팅이 발생하지 않는다. **함수 표현식의 경우 함수 호이스팅이 아니라 변수 호이스팅이 발생하기 때문이다.** 함수 표현식은 스크립트 로딩 시점에 변수 객체에 함수를 할당하지 않고, runtime에 해석되고 실행된다.
