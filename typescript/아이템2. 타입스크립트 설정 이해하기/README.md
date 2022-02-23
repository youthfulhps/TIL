# 아이템 2. 타입스크립트 설정 이해하기

> 타입스크립트 컴파일러는 100개의 가까운 설정을 가지고 있다.

💬 코드가 주어졌을 때 타입체커의 지적없이 통과할 수 있을 지는 설정이 어떻게 되어 있는지 모른다면 알 수 없습니다. 다음과 같은 방법으로 타입스크립트 설정이 가능합니다.

```bash
~$ tsc --noImplicitAny main.ts
```

```json
tsconfig.json

{
	"complierOptions": {
		"noImplicitAny": true
	}
}
```

💬 가급적이면 설정파일을 사용하는 것을 권고합니다. 타입스크립트를 어떻게 사용할 계획인지 동료들과 다른 도구들에게 선언하는 역할을 합니다.

💬 타입스크립트는 어떻게 설정하느냐에 따라 완전히 다른 언어처럼 느껴질 수 있습니다. 설정을 제대로 사용하려면, `*noImplicitAny*` , `*strictNullChecks*` 를 이해해야 합니다.

> _`noImplicitAny`_ 는 변수들이 미리 정의된 타입을 가져야 하는지 여부를 제어한다.

💬 `noImplicitAny`가 해제되어 있다면, 다음 코드는 유효합니다. 타입스크립트가 추론한 함수의 타입은 에디터에서 확인 가능합니다.

```tsx
function add(a, b) {
  return a + b;
}

//function add(a: any, b: any): any
//'a' 매개변수에는 암시적으로 'any' 형식이 포함됩니다.
//'b' 매개변수에는 암시적으로 'any' 형식이 포함됩니다.
```

💬 `any`를 코드에 명시하지 않았지만, `any`타입으로 간주되기 때문에 '암시적 any' 라 부릅니다. `any`타입은 타입체커를 무기력하게 만드는 타입입니다. 자바스크립트 프로그램을 타입스크립트 프로그램으로 마이그레이션하기 위한 설정이 아니라면, `noImplicitAny` 를 설정하는 것이 권고됩니다.

> `strictNullChecks` 는 `null`과 `undefined`가 모든 타입에서 허용되는지 확인하는 설정이다.

💬 `strictNullChecks` 은 해제되었을 때와 설정되었을 때의 타입체커 지적을 확인해보면 어떤역할을 하는 설정인지 명확해 집니다.

```tsx
//strictNullChecks is false
const x: number = null;

//null은 유효한 값입니다.
```

```tsx
//strictNullChecks is true
const x: number = null;

//'null' 형식은 'number' 형식에 할당할 수 없습니다.
```

💬 `strictNullChecks` 는 `null`과 `undefined` 관련된 오류를 잡아내는 데 많은 도움을 주지만, 코드 작성을 어렵게 합니다. 하지만, 다음과 같은 끔직한 런타입 오류를 방지하기 위해 타입체커가 사전에 오류를 잡아내도록 역할을 부여하는 것이 권고됩니다.

💬 공동 프로젝트를 진행한다면 타입스크립트 컴파일러 설정이 동일해야 하며 프로젝트 초기에 설정을 고정시키는 것이 좋습니다.
