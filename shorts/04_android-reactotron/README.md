
reactotron에서 안드로이드 에뮬레이터 연결이 안될때,

https://github.com/infinitered/reactotron/issues/162

adb를 통해 해당 포트를 전달해주어야 한다.

```shell
adb reverse tcp:9090 tcp:9090
```
