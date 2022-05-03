# 아이템44. 타입 커버리지를 추적하여 타입 안전성 유지하기

noImplicitAny를 설정하고, 모든 암시적 any 대신 명시적 타입 구문을 추가해도
any 타입과 관련된 문제들로부터 안전하다고 할 수 없다.

- 명시적 any 타입

any 타입의 범위를 좁히고 구체적으로 만들어도 여전히 any 타입이다. 특히 any[]와 `{[key: string]: any}`같은
타입은 인덱스를 생성하면 단순 any가 되고 코드 전반에 영향을 미친다.

- 서드파티 타입 선언

@types 선언 파일로부터 사용하는 any 타입이 전파되기 때문에 noImplicitAny를 설정하고
any를 사용하지 않았더라도 여전히 any 타입은 코드 전반에 영향을 미친다.

any 타입은 타입 안전성과 생산성에 부정적 영향을 미칠 수 있으므로 프로젝트에서 any의 개수를 추적하는 것이 좋다.
npm의 `type-cover-age` 패키지를 활용하여 추적할 수 있는 몇 가지 방법이 있다.
any가 아니거나 any의 별칭이 아닌 타입을 가지고 있는 커버리지를 파악할 수 있다.

```shell
& npx type-coverage
9985 / 10117 98.69%
```

점수를 추적함으로써 시간에 지남에 따라 코드의 품질을 높일 수 있으며, 타입 커버리지 정보를 수집해 보는 것도 유용할 수 있다.
`type-coverage`를 실행할 때 `--detail` 플래그를 붙이면, any 타입이 있는 곳을 모두 출력해준다.

```shell
$ npx type-coverage --detail
path/to/codets:1:10 getColumnInfo
...
```

코드에 any가 남아있는 이유는 다양하다.

- 오류를 간단하게 해결하기 위해 명시적인 any 선언
- 타입 오류 발생에 대해서 해결하는 데 시간을 쏟고 싶지 않은 경우
- 급하게 작업하느라

그렇다면, any가 등장하는 몇 가지 문제와 그 해결책을 살펴보자.

표 형태의 데이터에서 어떤 종류의 열 정보를 만들어내는 함수를 만든다고 가정해보자.

```ts
const utils = {
  buildColumnInfo(s: any, name: string): any {},
};
declare let appState: { dataSchema: unknown };
function getColumnInfo(name: string): any {
  return utils.buildColumnInfo(appState.dataSchema, name); // Returns any
}
```

이때 `utils.buildColumnInfo`를 호출은 any를 반환하기 때문에 `getColumnInfo` 또한 반환 타입을 any로 명시했다.
이후에 `utils.buildColumnInfo`를 선언된 타입을 반환하도록 개선하더라도 `getColumnInfo`는 반환 타입인 any로 반환되어
`utils.buildColumnInfo`에서 반환하는 선언된 타입 정보를 날려버리게 된다. 이 경우 `getColumnInfo` 반환 타입 또한 업데이트
해주어야 한다.

서드파티 라이브러리로부터 비롯되는 any 타입은 몇 가지 형태로 등장할 수 있지만, 가장 극단적인 예는 전체 모듈에
any 타입을 부여하는 것이다.

```ts
declare module "my-module";
```

앞의 선언으로 인해 `my-module`에서 어떤 것이든 오류없이 임포트할 수 있게 되지만, 임포트한 모든 심볼은 any 타입이며
사용되는 곳마다 any 타입이 스며들게 된다.

일반적인 모듈의 사용법과 동일하기 때문에 타입 정보가 모두 제거되었다는 것을 간과할 수 있다. 협업자의 수정, 알아채지 못하는 경우,
모듈에 대한 공식 타입 선언 업데이트 등의 경우가 @types으로 부터 any 타입의 양산을 유발할 수 있다.

결론적으로, noImplicitAny가 설정되어 있어도, 명시적 any 또는 서드파티 타입 선언을 통해 any 타입은 코드 내에
여전히 존재할 수 있다는 점을 주의해야 하며, 작성한 프로그램의 타입이 얼마나 잘 선언되어 있는지 추적하여 any를 줄이고
타입 안전성을 꾸준히 높여야 한다.
