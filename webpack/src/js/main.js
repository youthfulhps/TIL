// import '@babel/polyfill';  //for ES6

console.log("getting-started-with-webpack!");

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("cool!");
  }, 1000);
});

console.log(promise);

const obj = Object.assign({}, { a: 1 }, { a: 2 });

console.log(obj);

console.log(Array.from([1, 2, 3], (v) => v + v));
