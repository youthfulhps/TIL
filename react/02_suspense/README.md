# Suspense

리엑트v16.6에 새롭게 추가된 Suspense 구현체와 그 개념은 `React.lazy`를 통해
웹에서 필요한 자원을 동적으로 불러와 필요할 때 로드할 수 있도록 하여 사용자가 첫 페이지를
로드할 때 당장 사용되지 않은 자원을 불러오는 낭비를 막고 전략적인 자원 관리를 할 수 있게
한다.

Suspense로 감싸주면 해당 부분을 자동으로 스플리팅되어 번들이 생성되고, 해당 컴포넌트 랜더링이
필요할때 비동기적으로 번들을 요청하여 사용한다.

여기서, `React.lazy`를 통해 분리된 코드 분할 구성 요소를 가져올 때 사용자는 약간의 지연을
경험하게 되는데, Suspense는 `fallback`에서 로딩 중에 노출시킬 UI를 지정하여 동적으로
불러오는 UI의 선언적인 관리가 가능하도록 한다. 리엑트답게 선언적으로 비동기 과정을 다룰 수 있게
된 것.

```jsx
import React, { lazy } from "react";

const AvatarComponent = lazy(() => import("./AvatarComponent"));

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

### Suspense for Data fetching

웹에서 지연 로딩을 통해 동적으로 가져올 수 있는 자원의 대상은 웹에서 필요로 하는 모든
자원이 그 대상이 될 수 있다.
리엑트v16.6에서의 Suspense는 주로 자바스크립트 번들을 분리하고 이를 지연 로딩의
대상으로 삼고 이를 기다리고 선언적으로 관리할 수 있도록 하는 역할이었다면, React18에서의
Suspense는 웹에서 필요로 하는 모든 자원에 대한 기다림을 관리할 수 있는 구현체로 확장된다.

__쉽게 생각하면, 스프리팅된 번들을 필요할때 비동기적으로 요청하여 받아오는 것, 여기서 컴포넌트 번들이 아닌
데이터가 기다리는 대상이 된 것.__ 

### 선언적 리엑트 개발을 통해 개발자의 책임을 리엑트에게 위임할 수 있다.

리엑트에서 비동기적으로 가져온 데이터를 통해 UI를 랜더링하는 코드의 예시를 보자.

```jsx
function UserProfile() {
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
에 대한 분기처리로 인해 가독성이 떨어지고 복잡해지는 코드를 마주하게 되고, 이를 통해 발생하는
대기, 실패, 정상 상태에 대한 모든 책임을 개발자가 가진다.

이제, Suspense와 Error Boundary를 사용해서 데이터라는 웹 자원에 대한 기다림 처리를
선언적으로 작성해보자.

```jsx
const resource = fetchProfileData();
function App() {
  return (
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loader />}>
        <UserProfile />
      </Suspense>
    </ErrorBoundary>
  );
};

function UserProfile() {
  const user = resource.user.read();
  return <div>{user.userName}</div>
};
```

## waterfull rendering 이슈를 해결하고 동시성을 유지한 랜더링 (Render-as-You-Fetch)

부모 컴포넌트의 패칭 결과를 통해 랜더링되는 자식 컴포넌트는 부모의 패칭에 의존적으로 랜더링이 시작된다.
부모의 패칭 결과와 랜더링이 완료되어야 자식 컴포넌트의 패칭과 랜더링이 시작된다.

Suspense를 사용하면 데이터 로딩이 완료되지 않아 Fallback UI를 보여주게 되더라도, 'hidden' 모드로
자식 컴포넌트 랜더링을 시작한다. (만약, 부모 컴포넌트 랜더링 중 패칭이 시작되고 Suspense에서 해당 자원을 기다리고 있다면,
자식 혹은 다른 컴포넌트를 먼저 랜더링할 수 있도록 한다. 데이터 패칭(Transition)보다 컴포넌트 랜더링이 우선순위가 높음.)

### 그럼, 리엑트는 Suspense를 통해 데이터 패칭 상태를 매번 읽고 상호작용할 수 있는 것인가.

“Andrew Clark”의 Suspense에 대한 트윗에서 간단한 Suspense 동작을 이해할 수 있다.

1. render 메서드에서 캐시로부터 값을 읽기를 시도한다. (여기서 값은 기다리고 있는 자원의 대상)
2. value가 캐시되어 있으면 정상적으로 랜더링
3. value가 캐시되어 있지 않으면 캐시는 'Promise를 throw'.
4. promise가 resolve되면 리엑트는 promise를 throw 한곳으로부터 재시작한다.

즉,

1. Suspense가 child component를 랜더링 할 때, 데이터를 캐시로부터 읽으려 한다. (가령, 데이터 패칭을 통해 얻을 수 있는 유저 정보)
2. 데이터가 없으면 child component의 캐시는 promise를 throw한다. throw된 프로미스는 데이터를 패칭하기 위한 작업 그 자체
3. Suspense는 promise를 전달받았다면 fallback UI를 반환하고, resolve 되었다면 다시 child component를 보여준다.
4. 혹은 에러라면 에러를 throw해서 ErrorBoundary에서 받을 수 있도록 함.

정리하자면, 컴포넌트는 데이터 패칭 중(Promise가 아직 resolve 되지 않은 상태) 가장 가까운 Suspense에게
promise 객체를 throw한다. 그럼 Suspense는 fallback UI를 보여주고 다른 컴포넌트 랜더링 작업으로 작업권을 넘긴다.
그러다 Suspense가 받은 promise가 resolve되면 fallback UI를 내리고 정상적인 컴포넌트를 랜더링한다.

### Suspense 모델의 개념적 구현체

```js
// Infrastructure.js
let cache = new Map();
let pending = new Map();
function fetchTextSync(url) {
  // 캐싱된 값이 있다면, 캐시값 반환 (promise의 resolve 결과)
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  // 대기 중인 promise 작업이 있다면, 해당 promise를 다시 반환.
  if (pending.has(url)) {
    throw pending.get(url);
  }
  
  // 데이터 패칭 작업을 하는 promise 객체 그 자체.
  let promise = fetch(url).then(
    response => response.text()
  ).then(
    text => {
      pending.delete(url);
      cache.set(url, text);
    }
  );
  // 대기열에 추가하고, promise를 throw.
  pending.set(url, promise);
  throw promise;
}

async function runPureTask(task) {
  for (;;) {
    // 무한 루프
    try {
      // fetchTextSync에서 resolve된 결과값을 반환하면 해당 값을 반환.
      return task();
    } catch (x) {
      // 아직 promise가 resolve되지 않아 fetchTextSync가 promise를 throw하면,
      if (x instanceof Promise) {
        // await로 resolve 시도
        await x;
      } else {
        // x가 에러일 수 있음. error throw.
        throw x;
      }
    }
  }
}
```

위에서 보였던 read() 함수.

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
    // 클로저로 status, result, suspense를 은닉하고 기억.
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

## Reference

- https://web.dev/i18n/ko/code-splitting-suspense/
- https://maxkim-j.github.io/posts/suspense-argibraic-effect
- https://blog.mathpresso.com/conceptual-model-of-react-suspense-a7454273f82e
