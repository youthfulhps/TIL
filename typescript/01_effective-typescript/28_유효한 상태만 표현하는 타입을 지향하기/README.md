# 아이템28. 유효한 상태만 표현하는 타입을 지향하기

타입을 잘 설계하면 코드는 직관적으로 작성할 수 있다. **효과적으로 타입을 설계하려면, 유효한 상태만 표현할 수 있는 타입을 만들어내는 것이 가장 중요하다.**
이런 관점에서 타입 선계가 잘못된 상황을 알아보고 예제를 통해 잘못된 설계를 바로잡아 볼 것이다.

웹 애플리케이션을 만든다고 가정해보자. 애플리케이션에서 페이지를 선택하면 페이지의 내용을 로드하고 화면을 표시합니다.
페이지의 상태는 다음과 같습니다.

```ts
interface State {
  pageText: string;
  isLoading: boolean;
  error?: string;
}
```

페이지를 그리는 render 함수를 작성할 때는 상태 객체의 필드를 전부 고려해서 상태 표시를 분기해야 한다.

```ts
interface State {
  pageText: string;
  isLoading: boolean;
  error?: string;
}
declare let currentPage: string;
function renderPage(state: State) {
  if (state.error) {
    return `Error! Unable to load ${currentPage}: ${state.error}`;
  } else if (state.isLoading) {
    return `Loading ${currentPage}...`;
  }
  return `<h1>${currentPage}</h1>\n${state.pageText}`;
}
```

위 코드는 분기 조건이 확실히 분리되어 있지 않다. isLoading이 true이고 동시에 error값이 존재하면
로딩 혹은 에러 상태인지 확실히 구분할 수 없다. 필요한 정보가 부족하다.

다른 예제를 보자. 페이지를 전환하는 changePage 함수는 다음과 같다.

```ts
interface State {
  pageText: string;
  isLoading: boolean;
  error?: string;
}
declare let currentPage: string;
function getUrlForPage(p: string) {
  return "";
}
async function changePage(state: State, newPage: string) {
  state.isLoading = true;
  try {
    const response = await fetch(getUrlForPage(newPage));
    if (!response.ok) {
      throw new Error(`Unable to load ${newPage}: ${response.statusText}`);
    }
    const text = await response.text();
    state.isLoading = false;
    state.pageText = text;
  } catch (e) {
    state.error = "" + e;
  }
}
```

이 코드 또한 문제점이 많다.

- 오류가 발생했을 때 state.isLoading이 false로 변경되지 않는다.
- 오류를 나타내는 state.error 또한 초기화되지 않는다.
- 페이지 로딩 중에 사용자가 페이지를 변경하면 어떤 일이 발생할 지 예상하기 어렵다.

이 문제들의 원인은 바로 **상태 값의 두 가지 속성이 동시에 정보가 부족하다.** 요청이 실패한 것인지 여전히 로딩 중인지 알 수가 없다.
또한, **두 가지 속성이 충돌할 수 있다는 것이다.** State 타입은 isLoading이 true이면서 동시에 error값이 설정되는
무효한 분기 상태를 허용한다. 무효한 상태가 존재하면 render와 changePage 둘다 제대로 구현할 수 없다.

이제, 애플리케이션의 상태를 좀 더 상세하게 표현해보자.

```ts
interface RequestPending {
  state: "pending";
}
interface RequestError {
  state: "error";
  error: string;
}
interface RequestSuccess {
  state: "ok";
  pageText: string;
}
type RequestState = RequestPending | RequestError | RequestSuccess;

interface State {
  currentPage: string;
  requests: { [page: string]: RequestState };
}
```

네트워크 요청 과정 각각의 상태를 명시적으로 모델링하는 태그된 유니온이 사용되었다. 상태를 나타내는 타입의 코드가 늘어났지만
무효한 상태를 허용하지 않도록 크게 개선되었다. 현재 페이지는 발생하는 모든 요청의 상태로서, 명시적으로 모델링되었다.

```ts
interface State {
  currentPage: string;
  requests: { [page: string]: RequestState };
}
function getUrlForPage(p: string) {
  return "";
}
function renderPage(state: State) {
  const { currentPage } = state;
  const requestState = state.requests[currentPage];
  switch (requestState.state) {
    case "pending":
      return `Loading ${currentPage}...`;
    case "error":
      return `Error! Unable to load ${currentPage}: ${requestState.error}`;
    case "ok":
      return `<h1>${currentPage}</h1>\n${requestState.pageText}`;
  }
}

async function changePage(state: State, newPage: string) {
  state.requests[newPage] = { state: "pending" };
  state.currentPage = newPage;
  try {
    const response = await fetch(getUrlForPage(newPage));
    if (!response.ok) {
      throw new Error(`Unable to load ${newPage}: ${response.statusText}`);
    }
    const pageText = await response.text();
    state.requests[newPage] = { state: "ok", pageText };
  } catch (e) {
    state.requests[newPage] = { state: "error", error: "" + e };
  }
}
```

처음 등장했던 render와 changePage의 모호함은 완전히 사라졌다. 현재 페이지가 무엇인지 명확하고,
모든 요청은 정확히 하나의 상태로 떨어진다.

타입을 설계할 때는 어떤 값들을 포함하고 어떤 값들을 제외할지 신중하게 생각해야 한다. 유효한 상태를 표현하는 값만
허용한다면 코드를 작성하기 쉬워지고 타입 체크가 용이해진다.
