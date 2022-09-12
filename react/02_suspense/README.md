# Suspense

리엑트v16.6에 새롭게 추가된 Suspense 구현체와 그 개념은 `React.lazy`를 통해
웹에서 필요한 자원을 동적으로 불러와 필요할 때 로드할 수 있도록 하여 사용자가 첫 페이지를
로드할 때 당장 사용되지 않은 자원을 불러오는 낭비를 막고 전략적인 자원 관리를 할 수 있게
한다.

여기서, `React.lazy`를 통해 분리된 코드 분할 구성 요소를 가져올 때 사용자는 약간의 지연을
경험하게 되는데, Suspense는 `fallback`에서 로딩 중에 노출시킬 UI를 지정하여 동적으로
불러오는 UI의 선언적인 관리가 가능하도록 한다.

```jsx
import React, { lazy } from "react";

const AvatarComponent = React.lazy(() => import("./AvatarComponent"));

return (
  <Suspense fallback={<Loader />}>
    <AvatarComponent />
  </Suspense>
);
```

만약, 로딩 실패에 대해 처리하고 싶다면, Suspense와 [Error Boundary](../01_error-boundaries/README.md)
를 함께 사용하여 지연 로딩 중 발생한 에러가 전역으로 퍼지지 않고, 에러 경계 내에서
처리할 수 있도록 하는 에러 처리 또한 선언적으로 관리할 수 있다.

```jsx
import React, { lazy } from "react";

const AvatarComponent = React.lazy(() => import("./AvatarComponent"));

return (
  <ErrorBoundary>
    <Suspense fallback={<Loader />}>
      <AvatarComponent />
    </Suspense>
  </ErrorBoundary>
);
```

## Suspense for Data fetching

웹에서 지연 로딩을 통해 동적으로 가져올 수 있는 자원의 대상은 웹에서 필요로 하는 모든
자원이 그 대상이 될 수 있다.

리엑트v16.6에서의 Suspense는 주로 자바스크립트 번들을 분리하고 이를 지연 로딩의
대상으로 삼고 이를 기다리고 선언적으로 관리할 수 있도록 하는 역할이었다면, React18에서의
Suspense는 웹에서 필요로 하는 모든 자원에 대한 기다림을 관리할 수 있는 구현체로 확장된다.

리엑트에서 비동기적으로 가져온 데이터를 통해 UI를 랜더링하는 코드의 예시를 보자.

```jsx
const UserProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get("/user");
        setUser(data);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) return <Loader />;
  if (isError) return <Error />;
  if (!user) return <Empty />;

  return <div>{user.userName}</div>;
};
```

데이터 패칭 과정의 상태를 컴포넌트에서 공유받기 위해 사용되는 `isLoading`, `isError`
에 대한 분기처리로 인해 가독성이 떨어지고 복잡해지는 코드를 마주하게 된다.

이제, Suspense와 Error Boundary를 사용해서 데이터라는 웹 자원에 대한 기다림 처리를
선언적으로 작성해보자.

```jsx
const UserProfile = () => {
  const { data } = axios.get("/user");
  return <div>{user.userName}</div>;
};

const App = () => {
  return (
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loader />}>
        <UserProfile />
      </Suspense>
    </ErrorBoundary>
  );
};
```

그럼, 여기서 Suspense, ErrorBoundary는 비동기 요청을 가진 컴포넌트의
요청 상태를 어떻게 공유받을 수 있을까

리엑트 문서 예제를 살펴보면, 컴포넌트가 랜더링을 시도할 때 패칭 값을 읽으려는
시도를 하고, `read()`에서 throw된 결과값을 전달받아 상태별 UI를 반환한다.

```jsx
export function fetchProfileData() {
  let userPromise = fetchUser();
  let postsPromise = fetchPosts();
  return {
    user: wrapPromise(userPromise),
    posts: wrapPromise(postsPromise),
  };
}
ㅔ;

function wrapPromise(promise) {
  let status = "pending";
  let result;

  let suspender = promise.then(
    (r) => {
      status = "success";
      result = r;
    },
    (e) => {
      status = "error";
      result = e;
    }
  );

  return {
    read() {
      if (status === "pending") {
        throw suspender; // Suspense fallback UI
      } else if (status === "error") {
        throw result; // Error Boundary fallback UI
      } else if (status === "success") {
        return result; // Success UI
      }
    },
  };
}
```

개인 프로젝트에서 Suspense와 Error Boundary를 적용하는 [PR](https://github.com/youthfulhps-tutorial/github-electron/pull/12)을 오픈했다.

## Reference

https://web.dev/i18n/ko/code-splitting-suspense/

https://maxkim-j.github.io/posts/suspense-argibraic-effect
