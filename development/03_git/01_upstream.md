# Upstream

프로젝트 기여를 위해 레포를 fork하게 되는데, 여러 기여자들에 의해 원본 소스는 계속 업데이트된다.
소스 코드를 항상 동기화하는 습관 필요!

## 시나리오

1. 프로젝트 기여를 위해 fork 진행
2. fork 해두었던 레포와 원본 레포의 동기화 필요

## upstream 등록

원본 소스코드가 위치하는 곳을 upstream 으로 칭하는데, 해당 명칭으로 원본 소스의 위치를 등록해주어야 한다.
추가한후 upstream이 잘 등록되었는 지 확인!

```shell
~$ git remote add upstream {....git}
~$ git remote -v
```

upstream을 제거하고자 한다면,

```shell
~$ git remote remove upstream
```

## 동기화 및 머지

동기화를 위해 앞선 원본 레포의 변경사항을 불러와 로컬 레포에 병합하고, 이후 리모트에 푸시한다.

```shell
~$ git fetch upstream
~$ git merge upstream/{repo main branch ex)main or master}
~$ git push
```



