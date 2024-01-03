## react-query v5 with Suspense

## useQuery with Suspense

`suspense: true` 설정을 가진 useQuery는 상위 부모 컴포넌트 (Suspense, Error Boundary)를 통해
쿼리 인스턴스가 가진 데이터와 원하는 타입임을 보장받을 수 있는데, 이후 코드 영역에서 쿼리의 데이터를 참조하면 
타입을 보장받을 수 없어 성공 여부를 통해 분기 영역을 유지하거나, 타입 단언을 해서 사용해야 했다.
이후 코드 영역에서 타입을 보장받을 수 없는 이슈가 있었다.

```ts
const useContributionsCollectionQuery = (from: string, to: string) => {
  const { data: contributionsCollection, isSuccess } = useQuery<ContributionsCollection, AxiosError>({
    queryKey: ['contributionsCollection', from, to],
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data } = await getContributionsCollection(from, to);
      const destructuredContributionsCollection = getDestructuredContributionsCollection(data);

      return destructuredContributionsCollection;
    },
  });

  contributionsCollection // ContributionsCollection | undefined
  
  if (isSuccess) {
    contributionsCollection // ContributionsCollection
  }
};
```

### useSuspenseQuery

```ts
const useContributionsCollectionQuery = (from: string, to: string) => {
  const { data: contributionsCollection } = useSuspenseQuery<ContributionsCollection, AxiosError>({
    queryKey: ['contributionsCollection', from, to],
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data } = await getContributionsCollection(from, to);
      const destructuredContributionsCollection = getDestructuredContributionsCollection(data);

      return destructuredContributionsCollection;
    },
  });

  contributionsCollection // ContributionsCollection
};
```

위와 같은 이슈때문에 등장하게 된 useSuspenseQuery는 Suspense로 감싸진 내부의 쿼리에 대해 성공을 보장하여
데이터의 타입을 보장받을 수 있게 되었다.

코드 분석

각각의 쿼리는 QueryObserver라는 클래스의 인스턴스로 생성됨, 생성된 인스턴스에 옵션 중 shouldSuspend가 참으로 평가되면
결과를 안기다리고 promise(fetchOptimistic)를 던짐. suspense에게 던진 promise가 resolve되면 랜더링

## Reference

- https://tanstack.com/query/v4/docs/react/community/suspensive-react-query
 
