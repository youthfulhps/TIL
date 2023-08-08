pnpm 글로벌 설치를 할때 글로벌 설치 경로가 지정되어 있지 않을때 발생하는 에러 해결.
pnpm에서 제공하는 명령어가 있었던 것 같은데, 일단 이렇게라도.

```shell
~$ nano ~/.zshrc

# 추가
# pnpm
export PNPM_HOME="/Users/*/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end
```
