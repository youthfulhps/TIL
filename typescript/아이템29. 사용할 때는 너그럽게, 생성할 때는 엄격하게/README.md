# 아이템29. 사용할 때는 너그럽게, 생성할 때는 엄격하게

제목은 TCP와 관련해서 존 포스텔이 쓴 견고성 원칙에서 따온 것이다.

_TCP 구현체는 견고성의 일반적 원칙을 따라야 한다. 당신의 직업은 엄격하게 하고 다른 사람의 직업은 너그럽게 받아드려야 한다_

함수 시그니처에도 비슷한 규칙을 적용해야 한다. 함수의 매개변수 타입의 범위가 넓어도 되지만, 결과를 반환할 때는 일반적으로 타입의 범위가 더 구체적이어야 한다.

3D 매핑 API는 카메라의 위치를 지정하고 경계 박스의 뷰포트를 계산하는 방법을 제공한다.

```ts
declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): CameraOptions;
```

카메라의 위치를 잡기 위해 viewportForBounds의 결과를 setCamera로 바로 전달한다면 편리할 것이다.
사용되는 타입을 살펴보면,

```ts
interface CameraOptions {
  center?: LngLat;
  zoom?: number;
  bearing?: number;
  pitch?: number;
}
type LngLat =
  | { lng: number; lat: number }
  | { lon: number; lat: number }
  | [number, number];
```

일부값을 건드리지 않고 다른 값을 설정할 수 있도록 CameraOptions의 필드를 모두 선택적으로 정의하고, 유사하게 LngLat 타입도 setCamera의 매개변수 범위를 넓혀 준다. 이러한 편의성을 제공하면 함수 호출을 쉽게 할 수 있다.

viewportForBounds 함수는 또 다른 자유로운 타입을 매개변수로 받는다.

```ts
type LngLatBounds =
  | { northeast: LngLat; southwest: LngLat }
  | [LngLat, LngLat]
  | [number, number, number, number];
```

쌍만 맞다면, [number, number, number, number] 4-튜플을 사용하여 경계를 지정할 수 있으며, 모서리와 위도/경도 쌍을 제공할 수 있다. LngLat는 세 가지 형태를 받을 수 있기 때문에 LngLatBounds의 가능한 형태는 19가지 이상이 된다.

이제 GeoJSON 기능을 지원하도록 뷰포트를 조절하고, 새 뷰포트를 URL에 저장하는 함수를 작성해보자.

```ts
function focusOnFeature(f: Feature) {
  const bounds = calculateBoundingBox(f);
  const camera = viewportForBounds(bounds);
  setCamera(camera);
  const {
    center: { lat, lng },
    zoom,
  } = camera;
  // ~~~      Property 'lat' does not exist on type ...
  //      ~~~ Property 'lng' does not exist on type ...
  zoom; // Type is number | undefined
  window.location.search = `?v=@${lat},${lng}z${zoom}`;
}
```

lat, lng 속성이 없고, 타입이 number | undefined로 추론되는 오류들이 존재한다. 근본적인 원인은 사실 viewportBounds의 **타입 선언이 사용될 때뿐만 아니라 만들어질 때에도 너무 자유롭다는 것이다.**

수많은 선택적 속성을 가지는 반환 타입과 유니온 타입은 viewportForBounds를 사용하기 어렵게 만든다.

매개변수의 타입의 범위가 넓으면 사용하기 편리하지만, 반환 타입의 범위가 넓으면 불편하다. 즉, **사용하기 편리한 API일수록 반환 타입이 엄격하다.**

유니온 타입의 요소별 분기를 위한 한 가지 방법은 좌표를 위한 기본 형식을 구분하는 것이다. 배열과 배열 같은 것의 구분을 위해 LngLat, LngLatLike로 구분할 수 있다. 또한 setCamera 함수가 매개변수로 받을 수 있도록 완전하게 정의된 Camera 타입과 Camera 타입이 부분적으로 정의된 버전을 구분할 수도 있다.

```ts
interface LngLat {
  lng: number;
  lat: number;
}
type LngLatLike = LngLat | { lon: number; lat: number } | [number, number];

interface Camera {
  center: LngLat;
  zoom: number;
  bearing: number;
  pitch: number;
}
interface CameraOptions extends Omit<Partial<Camera>, "center"> {
  center?: LngLatLike;
}
type LngLatBounds =
  | { northeast: LngLatLike; southwest: LngLatLike }
  | [LngLatLike, LngLatLike]
  | [number, number, number, number];

declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): Camera;
function focusOnFeature(f: Feature) {
  const bounds = calculateBoundingBox(f);
  const camera = viewportForBounds(bounds);
  setCamera(camera);
  const {
    center: { lat, lng },
    zoom,
  } = camera; // OK
  zoom; // Type is number
  window.location.search = `?v=@${lat},${lng}z${zoom}`;
}
```

요약하자면, 보통 매개변수 타입은 반환 타입에 비해 범위가 넓은 경향이 있다. 선택적 속성과 유니온 타입은 반환 타입보다 매개변수 타입에 더 일반적이다. 매개변수와 반환 타입의 재사용을 위해서 기본 형태와 느슨한 형태를 도입하는 것이 좋다.
