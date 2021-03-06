# 아이템45. devDependencies에 typescript와 @types 추가하기

npm에서는 세 가지 종류의 의존성을 구분해서 관리하며, 각각의 의존성은 package.json 파일 내의 별도 영역에 들어있다.

- dependencies, 현재 프로젝트를 실행하는 데 필수적인 라이브러리가 추가된다. 가령, 런타임에 lodash가 사용된다면
  dependencies에 포함되어야 한다.

- devDependencies, 현재 프로젝트를 개발하고 테스트하는 데 사용되지만, 런타임에는 필요 없는 의존성이 추가된다.
  가령, 프로젝트에서 테스트에 사용되는 프레임워크가 devDependencies에 포함된다.
  만약, 프로젝트를 npm에 공개해서 다른 사용자가 해당 프로젝트를 설치한다면, devDependencies에 포함된
  라이브러리들은 설치에서 제외된다.

- peerDependencies, 런타임에 필요하지만, 의존성을 직접 관리하지 않는 라이브러리들이 포함된다.
  플러그인과 같은 모듈이 그 예시이다.

타입스크립트 개발자라면 라이브러리를 추가할 때 어떤 종류의 의존성을 사용해야 할 지 알고 있어야 하는데,
**타입스크립트는 개발 도구일 뿐 타입 정보는 런타임에 존재하지 않기 때문에 타입스크립트와 관련된 라이브러리는
일반적으로 devDependencies에 속한다.**

그렇다면, 모든 타입스크립트 프로젝트에서 공통적으로 고려해야 할 의존성 두 가지를 살펴보자.

먼저, 타입스크립트 자체의 의존성을 고려해야 한다. 타입스크립트를 시스템 레벨로 설치하는 것을 지양해야 하는데
그 이유는 팀원들 모두가 항상 동일한 버전을 설치한다는 보장이 없고, 프로젝트를 셋업할 때 별도의 단계가 필요하기 때문이다.
대부분의 타입스크립트 IDE들은 devDependencies를 통해 설치된 타입스크립트 버전을 인식할 수 있도록 되어 있고,
커멘드 라인에서 npx를 사용해서 devDependencies를 통해 설치된 타입스크립트 컴파일러를 실행할 수 있다.

다음으로는 타입 의존성(@types)를 고려해야 한다. 사용하려는 라이브러리에 타입 선언이 포함되어 있지 않더라도,
DefinitelyTyped (타입스크립트 커뮤니티)에서 유지보수하고 있는 자바스크립트 라이브러리의 타입을 정의한 모음에서
타입 정보를 얻을 수 있다. DefinitelyTyped에서 정의된 타입들은 npm 레지스트리의 @types 스코프에 공개된다.
즉, @types/jquery에는 제이쿼리 타입 정의가 있다. 하지만, 원본 라이브러리 자체가 dependencies에 있더라도 @types/~는 devDependencies에 존재해야 한다.
