# Tiny React

JSConf.ASIA 2019에서 다루어졌던 'Getting Closure on React Hooks' 발표에 대한 정리이다.
현 시점에서 꽤 지난 발표 내용이지만, 다시 봐도 재밌는 발표라 정리해두려 한다.

## 클로저 (Closure)

> ”[Closure] makes it possible for a function to have “private” variables” - W3Schools


```js
function getAdd() {
  let foo = 1;
  foo = foo + 1;
  return foo;
}

// add가 호출되는 시점에 생성되는 실행 컨텍스트에서 기억하고 있는 foo는 항상 1
console.log(getAdd()); // 2
console.log(getAdd()); // 2
console.log(getAdd()); // 2
console.log(getAdd()); // 2
console.log(getAdd()); // 2
```

```js
function getAdd() {
  let foo = 1;
  return function () {
    foo = foo + 1;
    return foo;
  }
}

// add 익명 함수를 반환하는 getAdd는 add를 반환하고 실행 컨텍스트 소멸
// add 익명 함수는 소멸된 getAdd의 컨텍스트를 스코프 체인으로 접근 가능
// 요 형태가 클로저 은닉!
const add = getAdd();

console.log(add()); // 2
console.log(add()); // 3
console.log(add()); // 4
console.log(add()); // 5
console.log(add()); // 6
```

## Tiny React

```js
const React = (function () {
  // 은닉, render를 다시 발생시켜도 즉시 실행으로 생성된 컨텍스트를 가지고 있음
  let hooks = [];
  let idx = 0;
  function useState(initValue) {
    const state = hooks[idx] || initValue;
    const _idx = idx;
    const setState = newValue => {
      hooks[_idx] = newValue;
    }
    idx++;
    return [state, setState];
  }

  function useEffect(callback, depArray) {
    const oldDeps = hooks[idx];
    let hasChanged = true;

    if (oldDeps) {
      // 새롭게 전달받은 deps와 기존 oldDeps의 변경점이 있는지 비교한다.
      hasChanged = depArray.some((dep, index) => !Object.is(dep, oldDeps[index]));
    }

    if (hasChanged) {
      callback();
    }

    hooks[idx] = depArray;
    idx++;
  }

  function render(Component) {
    idx = 0;
    const C = Component();
    C.render();
    return C;
  }

  return {useState, useEffect, render};
})();

function Component() {
  const [count, setCount] = React.useState(1);
  const [text, setText] = React.useState('apple');

  React.useEffect(() => {
    console.log('text has changed!');
  },[text])

  return {
    render: () => console.log({count, text}),
    click: () => setCount(count + 1),
    type: text => setText(text),
  }
}

// text has changed!
var App = React.render(Component); // { count: 1, text: 'apple' }
App.click();
var App = React.render(Component); // { count: 2, text: 'apple' }
App.click();
var App = React.render(Component); // { count: 3, text: 'apple' }
App.type('pear');
// text has changed!
var App = React.render(Component); // { count: 3, text: 'pear' }
```

## Reference

- https://www.youtube.com/watch?v=KJP1E-Y-xyo&t=164s














