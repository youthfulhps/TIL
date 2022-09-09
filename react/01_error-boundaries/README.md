# Error Boundaries

자바스크립트로부터 발생하는 에러가 리엑트 내부 상태들을 훼손하고 랜더링 문제를 발생시켰지만,
리엑트에서 적절하게 처리할 수 있는 방법을 제공하지 않았고, 이러한 문제를 해결하기 위해
리엑트v16 에서 새롭게 에러 경계(erorr-boundaries)라는 새로운 개념이 도입되었다.

에러 경계는 일부 UI에서 발생한 에러가 리엑트 앱 전역적으로 영향을 끼치게 되는 것을 막고,
에러 경계 하위 트리에서 발생한 자바스크립트 에러에 대해 기록을 남기고 깨진 컴포넌트 대신
콜백 UI로 전환될 수 있도록 한다.

### 에러 경계 구조

에러 경계는 `static getDerivedStateFromError()` 혹은 `componentDidCatch()`
가 선언된 클래스 컴포넌트로 구현되고, 이 컴포넌트 자체가 에러 경계가 된다.

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트 합니다.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 리포팅 서비스에 에러를 기록할 수도 있습니다.
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 폴백 UI를 커스텀하여 렌더링할 수 있습니다.
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

에러가 발생하면 콜백 UI를 랜더링하는 상태 전환 역할은 `static getDerivedStateFromError()`에서
담당하고, 에러 정보를 기록하려면 `componentDidCatch()`를 사용한다.

`children`에 담기는 하위 트리에서 발생하는 에러는 이제 에러 경계로서 구현된
상위 클래스 컴포넌트에서 모두 캐치할 수 있게 된다. 여기서 에러 경계를 세분화할 지,
앱 전체를 묶어 최상단에서 관리할지에 대한 에러 경계의 배치는 개발자의 자유이다.

```jsx
<ErrorBoundary>
  <UserProfile />
</ErrorBoundary>
```

리엑트 패키지, `react-devtools-shared`에서 구현한 `ErrorBoundary`는 에러 인스턴스를
통해 구분짓고 에러 인스턴스에 따라 각각 다른 폴백 UI를 노출시키는 훌륭한 예시를 제공한다.

```jsx
type Props = {|
  children: React$Node,
  canDismiss?: boolean,
  onBeforeDismissCallback?: () => void,
  store?: Store,
|};

type State = {|
  callStack: string | null,
  canDismiss: boolean,
  componentStack: string | null,
  errorMessage: string | null,
  hasError: boolean,
  isUnsupportedBridgeOperationError: boolean,
  isTimeout: boolean,
  isUserError: boolean,
  isUnknownHookError: boolean,
|};

const InitialState: State = {
  callStack: null,
  canDismiss: false,
  componentStack: null,
  errorMessage: null,
  hasError: false,
  isUnsupportedBridgeOperationError: false,
  isTimeout: false,
  isUserError: false,
  isUnknownHookError: false,
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = InitialState;

  static getDerivedStateFromError(error: any) {
    const errorMessage =
      typeof error === "object" && error !== null && typeof error.message === "string"
        ? error.message
        : null;

    const isTimeout = error instanceof TimeoutError;
    const isUserError = error instanceof UserError;
    const isUnknownHookError = error instanceof UnknownHookError;
    const isUnsupportedBridgeOperationError = error instanceof UnsupportedBridgeOperationError;

    const callStack =
      typeof error === "object" && error !== null && typeof error.stack === "string"
        ? error.stack.split("\n").slice(1).join("\n")
        : null;

    return {
      callStack,
      errorMessage,
      hasError: true,
      isUnsupportedBridgeOperationError,
      isUnknownHookError,
      isTimeout,
      isUserError,
    };
  }

  componentDidCatch(error: any, { componentStack }: any) {
    this._logError(error, componentStack);
    this.setState({
      componentStack,
    });
  }

  componentDidMount() {
    const { store } = this.props;
    if (store != null) {
      store.addListener("error", this._onStoreError);
    }
  }

  componentWillUnmount() {
    const { store } = this.props;
    if (store != null) {
      store.removeListener("error", this._onStoreError);
    }
  }

  render() {
    const { canDismiss: canDismissProp, children } = this.props;
    const {
      callStack,
      canDismiss: canDismissState,
      componentStack,
      errorMessage,
      hasError,
      isUnsupportedBridgeOperationError,
      isTimeout,
      isUserError,
      isUnknownHookError,
    } = this.state;

    if (hasError) {
      if (isTimeout) {
        return (
          <TimeoutView
            callStack={callStack}
            componentStack={componentStack}
            dismissError={canDismissProp || canDismissState ? this._dismissError : null}
            errorMessage={errorMessage}
          />
        );
      } else if (isUnsupportedBridgeOperationError) {
        return (
          <UnsupportedBridgeOperationView
            callStack={callStack}
            componentStack={componentStack}
            errorMessage={errorMessage}
          />
        );
      } else if (isUserError) {
        return (
          <CaughtErrorView
            callStack={callStack}
            componentStack={componentStack}
            errorMessage={errorMessage || "Error occured in inspected element"}
            info={
              <>
                React DevTools encountered an error while trying to inspect the hooks. This is most
                likely caused by a developer error in the currently inspected element. Please see
                your console for logged error.
              </>
            }
          />
        );
      } else if (isUnknownHookError) {
        return (
          <CaughtErrorView
            callStack={callStack}
            componentStack={componentStack}
            errorMessage={errorMessage || "Encountered an unknown hook"}
            info={
              <>
                React DevTools encountered an unknown hook. This is probably because the
                react-debug-tools package is out of date. To fix, upgrade the React DevTools to the
                most recent version.
              </>
            }
          />
        );
      } else {
        return (
          <ErrorView
            callStack={callStack}
            componentStack={componentStack}
            dismissError={canDismissProp || canDismissState ? this._dismissError : null}
            errorMessage={errorMessage}
          >
            <Suspense fallback={<SearchingGitHubIssues />}>
              <SuspendingErrorView
                callStack={callStack}
                componentStack={componentStack}
                errorMessage={errorMessage}
              />
            </Suspense>
          </ErrorView>
        );
      }
    }

    return children;
  }

  _logError = (error: any, componentStack: string | null) => {
    logEvent({
      event_name: "error",
      error_message: error.message ?? null,
      error_stack: error.stack ?? null,
      error_component_stack: componentStack ?? null,
    });
  };

  _dismissError = () => {
    const onBeforeDismissCallback = this.props.onBeforeDismissCallback;
    if (typeof onBeforeDismissCallback === "function") {
      onBeforeDismissCallback();
    }

    this.setState(InitialState);
  };

  _onStoreError = (error: Error) => {
    if (!this.state.hasError) {
      this._logError(error, null);
      this.setState({
        ...ErrorBoundary.getDerivedStateFromError(error),
        canDismiss: true,
      });
    }
  };
}
```

### Reference

https://ko.reactjs.org/docs/error-boundaries.html

https://github.com/facebook/react/tree/main/packages/react-devtools-shared/src/devtools/views/ErrorBoundary
