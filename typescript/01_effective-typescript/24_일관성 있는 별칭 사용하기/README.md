# 아이템24. 일관성 있는 별칭 사용하기

borough.location 배열에 loc이라는 별칭(alias)를 만들었다. 별칭의 값을 변경하면 원해 속성값 또한 변경된다.

```ts
const borough = { name: "Brooklyn", location: [40.688, -73.979] };
const loc = borough.location;
```

```
~$ loc[0] = 0;
> borough.location
[0, -73.979]
```

별칭을 남발해서 사용하면 제어 흐름을 분석하기가 어렵다. 타입스크립트에서도 별칭을 신중하게 사용해야 코드를 잘 이해할 수 있고
오류 또한 쉽게 찾을 수 있다.

다각형을 표현하는 자료구조에서, 다각형의 기하학적 구조를 표현하기 위해 exterior, holes 속성을 통해 정의하였고, bbox는 필수가 아닌 최적화 속성이다. bbox 속성을 사용하면 어떤 점이 다각형에 포함되는지 빠르게 체크할 수 있다.

```ts
interface Coordinate {
  x: number;
  y: number;
}

interface BoundingBox {
  x: [number, number];
  y: [number, number];
}

interface Polygon {
  exterior: Coordinate[];
  holes: Coordinate[][];
  bbox?: BoundingBox;
}
```

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  if (polygon.bbox) {
    if (
      pt.x < polygon.bbox.x[0] ||
      pt.x > polygon.bbox.x[1] ||
      pt.y < polygon.bbox.y[1] ||
      pt.y > polygon.bbox.y[1]
    ) {
      return false;
    }
  }

  // ... more complex check
}
```

여기서, polygon.bbox가 반복적으로 등장하기 때문에 임시 변수를 뽑아낸다고 가정했을 때 코드는 문제없이 동작하지만 편집기에서 오류를 표시한다. 이는 잘 동작했던 제어 흐름 분석을 방해했기 때문이다.

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const box = polygon.bbox;
  if (polygon.bbox) {
    if (
      pt.x < box.x[0] ||
      pt.x > box.x[1] ||
      //     ~~~                ~~~  Object is possibly 'undefined'
      pt.y < box.y[1] ||
      pt.y > box.y[1]
    ) {
      //     ~~~                ~~~  Object is possibly 'undefined'
      return false;
    }
  }
  // ...
}
```

어떤 동작으로 인해 오류가 발생했는지 box와 polygon.bbox의 타입을 조사해보자.

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  polygon.bbox; // Type is BoundingBox | undefined
  const box = polygon.bbox;
  box; // Type is BoundingBox | undefined
  if (polygon.bbox) {
    polygon.bbox; // Type is BoundingBox
    box; // Type is BoundingBox | undefined
  }
}
```

속성 체크에서 polygon.bbox는 타입이 BoundingBox로 강제되었지만, box는 그렇지 않았기 때문에 오류가 발생했다. 이러한 오류는
'별칭은 일관성 있게 사용한다'는 기본 원칙을 지키면 방지할 수 있다.

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const box = polygon.bbox;
  if (box) {
    if (
      pt.x < box.x[0] ||
      pt.x > box.x[1] ||
      pt.y < box.y[1] ||
      pt.y > box.y[1]
    ) {
      // OK
      return false;
    }
  }
  // ...
}
```

타입체커의 문제는 해결되었지만, 코드를 읽는 사람에게는 box와 bbox는 값은 값이지만 다른 이름을 사용한 문제가 남아있다.
객체 비구조화를 이용하면 보다 간경한 문법으로 일관된 이름을 사용할 수 있다.

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const { bbox } = polygon;
  if (bbox) {
    const { x, y } = bbox;
    if (pt.x < x[0] || pt.x > x[1] || pt.y < x[0] || pt.y > y[1]) {
      return false;
    }
  }
  // ...
}
```

하지만, 객체 비구조화를 이용할 때는 두 가지를 주의해야 한다.

- 전체 bbox 속성이 아니라 x,y가 선택저 속성일 경우 속성 체크가 더 필요하기 때문에 타입의 경계에 null값을 추가하는 것이 좋다.
- bbox에는 선택적 속성이 적합했지만, holes는 그렇지 않다. holes가 선택적이라면, 값이 없거나 빈 배열이었을 것이다. 차이가 없는데 이름을 구별한 것이다. 빈 배열은 'holes 없음'을 나타내는 좋은 방법이다.

별칭은 타입 체커뿐만 아니라 런타임에도 혼동을 야기할 수 있다.

```ts
const polygon: Polygon = { exterior: [], holes: [] };
function calculatePolygonBbox(polygon: Polygon) {}
// END
const { bbox } = polygon;
if (!bbox) {
  calculatePolygonBbox(polygon); // Fills in polygon.bbox
  // Now polygon.bbox and bbox refer to different values!
}
```

타입스크립트의 제어 흐름 분석은 지역 변수에는 잘 동작하나, 객체 속성에서는 주의해야 한다.

fn(polygon)호출은 polygon.bbox를 제거할 가능성이 있으므로 타입을 BoundingBox | undefined로 되졸리는 것이 안전하다. 그러나 함수를 호출할 때마다 속성 체크를 반복해야 하기 때문에 좋지 않다. **타입스크립트는 함수가 타입 정제를 무효화하지 않는다고 가정한다.** 하지만, 실제로는 무효화할 가능성이 있으니, polygon.bbox로 사용하는 대신, bbox 지역 변수로 뽑아내서 사용하면 bbox의 타입은 정확히 유지되지만, polygon.bbox의 값과 같게 유지되지 않을 수 있다.

```ts
function fn(p: Polygon) {
  /* ... */
}

polygon.bbox; // Type is BoundingBox | undefined
if (polygon.bbox) {
  polygon.bbox; // Type is BoundingBox
  fn(polygon);
  polygon.bbox; // Type is still BoundingBox
}
```
