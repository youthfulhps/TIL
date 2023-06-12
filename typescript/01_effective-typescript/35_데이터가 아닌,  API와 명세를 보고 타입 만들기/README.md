# 아이템35. 데이터가 아닌, API와 명세를 보고 타입 만들기

잘 설계된 타입을 사용한다는 것은 타입스크립트 사용을 즐겁게 해 주는 반면, 잘못 설계된 타입은 비극을 불러온다.
이런 상황에서 타입을 직접 작성하지 않고 자동으로 생성할 수 있다면 매우 유용할 것이다.

타일 형식, API, 명세 등 우리가 다루는 타입 중 최소한 몇 개는 프로젝트 외부에서 비롯된 것이다.
이러한 경우는 타입을 직접 작성하지 않고 자동으로 생성할 수 있다. 여기서 핵심은, **예시 데이터가 아니라
명세를 참고해 타입을 생성한다는 것이다.**

명세를 참고해 타입을 생성하면 타입스크립트는 사용자의 실수를 줄일 수 있다. 반면 예시 데이터를 참고해
타입을 생성하면 당장 전달받은 데이터만을 고려하게 되므로 예기치 않은 곳에서 오류가 발생할 수 있다.

가령, Feature의 경계 상자를 계산하는 calculateBoundingBox 함수를 사용해보자.

```ts
function calculateBoundingBox(f: Feature): BoundingBox | null {
  let box: BoundingBox | null = null;

  const helper = (coords: any[]) => {
    // ...
  };

  const { geometry } = f;
  if (geometry) {
    helper(geometry.coordinates);
  }

  return box;
}
```

Feature 타입은 명시적으로 정의된 적이 없다. 아이템 31에 등장한 focusOnFeature 함수 예제를 사용하여 작성해 볼 수 있다.
그러나, 공식 GeoJSON 명세를 사용하는 것이 더 낫다. 정의되어 있는 타입을 사용하기 위해 `@types/geojson` 의존성을 추가해보자.

```
npm install --save-dev @types/geojson
```

```ts
import { Feature } from "geojson";

function calculateBoundingBox(f: Feature): BoundingBox | null {
  let box: BoundingBox | null = null;

  const helper = (coords: any[]) => {
    // ...
  };

  const { geometry } = f;
  if (geometry) {
    helper(geometry.coordinates);
    // ~~~~~~~~~~~
    // Property 'coordinates' does not exist on type 'Geometry'
    //   Property 'coordinates' does not exist on type
    //   'GeometryCollection'
  }

  return box;
}
```

geojson에서 정의되어 있는 Feature를 사용하는 순간 오류가 발생한다. geometry에 coordinates 속성이 포함되어 있다고
가정한 것이 문제이다. 이러한 관계는 점, 선, 다각형을 포함한 많은 도형에서는 맞는 개념이나, GeoJSON은 다양한 도형의 모음인
GeometryCollection일 수도 있기 때문에 coordinates 속성이 없다. (즉, 예외적인 상황에 대한 인지와 정의된 타입을 사용하는 것이
타입 설계의 안정성을 가져온다.)

여기서, GeometryCollection를 타입 체크를 통해 명시적으로 차단거나, 모든 타입을 지원하는 helper로 변경하면 된다.

```ts
import { Feature, Geometry } from "geojson";
declare let f: Feature;
function helper(coordinates: any[]) {}
const { geometry } = f;
if (geometry) {
  if (geometry.type === "GeometryCollection") {
    throw new Error("GeometryCollections are not supported.");
  }
  helper(geometry.coordinates); // OK
}
```

```ts
const geometryHelper = (g: Geometry) => {
  if (geometry.type === "GeometryCollection") {
    geometry.geometries.forEach(geometryHelper);
  } else {
    helper(geometry.coordinates); // OK
  }
};
```

이와 같이 예외 상황이 포함되어 있지 않은 타입 설계는 완벽할 수 없다. 하지만, **명세를 기반으로 타입을 작성한다면
현재까지 경험한 데이터뿐만 아니라 사용 가능한 모든 값에 대해서 작동한다는 확신을 가질 수 있다.**

유사한 사례로 API 호출에도 비슷한 고려 사항들이 적용된다. API 명세로부터 타입을 생성할 수 있다면 그렇게 하는 것이 좋다.
특히 GraphQL 처럼 자체적으로 타입이 정의된 API에서 잘 동작한다. GraphQL API는 타입스크립트와 비슷한 타입 시스템을 사용하여
가능한 모든 쿼리와 인터페이스를 명세하는 스키마로 이루어져 있기 떄문이다. 이러한 인터페이스를 통해 특정 필드를 요청하는 쿼리를 작성할 수 있고, 타입스크립트 타입을 생성할 수도 있다.

만약 명세 정보나 공식 스키마가 없다면, 데이터로부터 타입을 생성해야 한다. 이를 위해 [quicktype](https://quicktype.io/) 같은 도구를 사용할 수 있다. 그러나, 생성된 타입이 실제 데이터와 일치하지 않을 수 있다는 점을 주의해야 하며 예외적인 경우가 존재할 수 있다는 것을 인지하고 사용해야 한다.

개발자는 이미 자동 타입 생성의 이점을 누리고 있기도 하다. 브라우저 DOM API에 대한 타입 선언은 공식 인터페이스로 부터 생성되었고 이를 통해
복잡한 시스템을 정확히 모델링하고 타입스크립트가 오류나 코드상의 의도치 않은 실수를 잡을 수 있게 한다.

코드의 구석 구석까지 타입 안정성을 챙기기 위해 API 또는 데이터 형식에 대한 타입 생성을 고려해야 한다. 데이터에 드러나지 않는 예외적인 경우들이 문제가 될 수 있기 때문에 데이터보다는 명세로부터 코드를 생성하는 것이 좋다.
