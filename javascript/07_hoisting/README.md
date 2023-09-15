## 호이스팅

자바스크립트 엔진은 자바스크립트 코드를 실행하기 전에 실행 컨텍스트를 생성한다. 이는 물리적인 객체로 존재하게 되는데, 변수 객체라는 프로퍼티를 가지고 있다.
변수 객체는 해당 스코프 내에 선언되어 있는 참조가능한 변수를 등록한다. 즉, 코드를 실행하기 전 코드가 실행되는 환경은 이미 선언된 변수에 대해 알고 있는 셈이다.
이러한 동작이 마치 변수가 최상단으로 끌어올려진 것처럼 보이는 데 이를 호이스팅이라고 한다.

### let/const와 var

[06_let-const-var](../06_let-const-var)

### 함수 호이스팅

### 함수 선언문

함수 선언문의 경우 함수가 정의되기 전에 함수 호출이 가능하다. 이는 어느 위치에서 선언되었든지 호출이 가능한데 이것을 함수 호이스팅이라고 한다. 
자바스크립트는 let, const를 포함하여 모든 선언(var, let, const, function, function*, class)를 호이스팅한다.

함수 선언문은 위에서 언급한 변수와 같이 변수 객체에 저장한다. 즉, 함수 선언, 초기화 할당이 동시에 이루어진다.

```js
square(3);

function square(number) {
  return number * number;
}
```

### 함수 표현식

자바스크립트의 함수는 일급 객체이기 때문에 변수에 할당이 가능하다. 함수를 변수에 할당한 구조를 함수 표현식이라 하는데, 이는 함수 호이스팅이 아닌 변수 호이스팅이
발생한다. 함수 표현식의 경우 스크립트 로딩 시점 즉, 코드에 진입하기 전에 실행 컨텍스트의 변수 객체에 등록되지 않고 런타임에 해석되고 실행된다. let/const와
마찬가지로 할당문을 만나기 전까지 초기화 및 할당이 이루어지지 않기 때문에 호이스팅되지 않는 것처럼 보인다.

여기서 눈여겨 봐야 할 점은 함수 표현식이 할당되는 변수가 어떤 변수 선언문을 사용했는지다. 다음과 같이 var의 경우 TypeError가 발생한다. var 선언문을 통해
선언된 square는 초기화되었기 때문에 ReferenceError가 아닌 TypeError가 발생한다.

```js
var res = square(3); // TypeError: square is not a function

var square = function(number) {
  return number * number;
}
```

반면 let/const로 선언된 square의 경우 아직 초기화되지 않았기 때문에 할당문을 만나기 전까지 ReferenceError가 발생한다.

```js
var res = square(3); // ReferenceError: Cannot access 'square' before initialization

const square = function(number) {
  return number * number;
}
```



