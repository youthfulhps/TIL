# 아이템31. 타입 주변에 null 값 배치하기

`strictNullChecks` 설정을 처음 켜면, `null`이나 `undefined` 값 관련된 오류들이 쏟아진다.
어떤 변수가 `null`이 될 수 있는지 없는지를 타입만으로는 명확하게 표현하기가 어렵기 때문에 오류를 걸러 내기 위해
if 구문을 코드 전체에 추가해야 한다고 생각할 수 있다.

값이 전부 `null`이거나 전부 `null`이 아닌 경우로 분명히 구분된다면, 값이 섞여있을 때보다 다루기 쉽다.
**타입에 `null`을 추가하는 방식으로 이러한 경우를 모델링할 수 있다.**

숫자들의 min, max를 계산하는 extent 함수를 예시로 보자. 이코드는 타입 체커를 통과하고 반환 타입은 number[]로 추론된다.
하지만, 여기서 설계의 결함이 존재한다. 가령, min, max 값이 0이라면, 값이 덧씌워져 버린다. if 구문의 조건문에 의해 0 또한 덮어쓰기 되기 때문이다.
또한, 파라미터의 nums가 비어있다면, min, max는 모두 undefined로 반환값이 [undefined, undefined]가 된다.

```ts
// tsConfig: {"strictNullChecks":false}

function extent(nums: number[]) {
  let min, max;
  for (const num of nums) {
    if (!min) {
      min = num;
      max = num;
    } else {
      min = Math.min(min, num);
      max = Math.max(max, num);
    }
  }
  return [min, max];
}
```

(`strictNullChecks` 설정을 프로젝트 설계 초기 단계에 켜는 것이 좋다는 것을 반영한다.)

이러한 설계의 좋은 해결법은 min, max를 하나의 객체 안에 넣고 `null`이거나 `null`이 아니게 하면 된다.
반환 타입이 [number, number] | null 로 사용하기가 더 수월해졌다.

```ts
function extent(nums: number[]) {
  let result: [number, number] | null = null;
  for (const num of nums) {
    if (!result) {
      result = [num, num];
    } else {
      result = [Math.min(num, result[0]), Math.max(num, result[1])];
    }
  }
  return result;
}
```

추가적으로 `null`과 `null`이 아닌 값을 섞어서 사용하면 클래스에서도 문제가 생긴다.

```ts
interface UserInfo {
  name: string;
}
interface Post {
  post: string;
}
declare function fetchUser(userId: string): Promise<UserInfo>;
declare function fetchPostsForUser(userId: string): Promise<Post[]>;

class UserPosts {
  user: UserInfo | null;
  posts: Post[] | null;

  constructor() {
    this.user = null;
    this.posts = null;
  }

  async init(userId: string) {
    return Promise.all([
      async () => (this.user = await fetchUser(userId)),
      async () => (this.posts = await fetchPostsForUser(userId)),
    ]);
  }

  getUserName() {
    // ...?
  }
}
```

두번의 네트워크 요청이 로드되는 동안 user와 posts 속성은 모두 `null`이다. 어떤 시점에서는 둘다, 둘 중 하나, 둘 다 null이거나 null일 수 있다.
속성값의 불확실성이 클래스의 모든 메서드에 나쁜 영향을 미친다.

아래와 같이 개선해보자. UserPosts 클래스는 완전히 null이 아니게 되었고, 메서드를 작성하기 쉬워졌다.
물론 이 경우에도 데이터가 부분적으로 준비되었을 때 작업을 시작해야 한다면, null과 null이 아닌 경우의 상태를 다루어야 한다.

```ts
class UserPosts {
  user: UserInfo;
  posts: Post[];

  constructor(user: UserInfo, posts: Post[]) {
    this.user = user;
    this.posts = posts;
  }

  static async init(userId: string): Promise<UserPosts> {
    const [user, posts] = await Promise.all([
      fetchUser(userId),
      fetchPostsForUser(userId)
    ]);
    return new UserPosts(user, posts);
  }

  getUserName() {
    return this.user.name;
  }
```
