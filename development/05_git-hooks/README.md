# Git hooks

모노레포 도입 POC 작업을 진행하면서 커밋 메시지가 예측가능해야 하고, 요약된 작업 정보가 표현되어야 한다는 것을 다시 한번 느꼈다.

1. 수정된 작업 영역이 표현될 것.
2. 지라 티켓의 고유 번호가 담겨 있을 것.
3. 작업 성질이 표현될 것.
4. 요약된 작업 정보가 표현되어 있을 것.

### husky

허스키, 깃훅을 용이하게 관리할 수 있도록 도와주는 라이브러리. 가령 커밋, 푸시와 같은 동작들에 트리거되어 발생하는 훅들을 쉽게 작성할 수 있게
도와준다. 

_'지늘이 높아서(?) 몹시 영리하고 기본적으로 단체 생활에 익숙하며, 남에게 폐를 끼치는 일은 적지만, ...'_

[나무위키](https://namu.wiki/w/%EC%8B%9C%EB%B2%A0%EB%A6%AC%EC%95%88%20%ED%97%88%EC%8A%A4%ED%82%A4)에서 허스키를 표현한 설명이다.
개발자의 작업 자유도는 부여되지만, 철저하게 약속된 플레이어가 되어야 한다는 의미에서 husky 역할과 유사하지 않나 싶다.

### commitlint

[commitlint](https://www.conventionalcommits.org/en/v1.0.0/)는 커밋 메세지를 린팅할 수 있도록 한다. 린트 설정을 통해 커밋 메세지의 형식을 제한한다. 기본적으로 해당 라이브러리는 통상적으로 사용되는
커밋 린트룰이 적용되어 있어 바로 husky와 함께 사용할 수 있다.

### 1. install

```shell
~$ pnpm add -D husky
~$ pnpm husky install
~$ yarn add --dev @commitlint/config-conventional @commitlint/cli
```

### 2. config 추가
```js
// commitlint.config.js

module.exports = { extends: ['@commitlint/config-conventional'] };
```

### 3. pre-commit

커밋 동작에 대해 트리거되는 훅이다. 커밋에 대해 발생시키고자 하는 작업들을 쉘 스크립트로 작성한다.
다음은 커밋 메세지를 커밋린트를 통해 체크하는 스크립트가 포함되어 있다.

```shell
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm commitlint --edit $1
```

### 4. pre-push

푸시 동작에 대해 트리거되는 훅이다. 푸시에 대해 발생시키고자 하는 작업들을 쉡 스크립트로 작성한다.
다음은 보호되는 브랜치(가령 main, develop, staging)에 직접 푸시를 방지하는 스크립트가 포함되어 있다.

```shell
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
PROTECTED_BRANCHES="^(main|develop|staging)"

if [[ "$BRANCH" =~ $PROTECTED_BRANCHES ]]
then
  echo "🚫 Cannot push to remote $BRANCH branch."
  exit 1
fi
```





