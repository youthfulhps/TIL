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
