function Person(name) {
  this.name = name;
}

Person.prototype.getName = function () {
  return this.name;
}

var me = new Person('Lee');
console.log(me.getName()); // Lee

console.log(Person.prototype);

Person.prototype.name = 'Kim';
console.log(Person.prototype);
console.log(Person.prototype.getName()); // Kim
