# 아이템36. 해당 분야의 용어로 타입 이름 짓기

_컴퓨터 과학에서 어려운 일은 단 두 가지뿐이다. 캐시 무효화와 이름 짓기., 필 칼튼_

지금까지의 타입 형태와 갑의 집합에 대해 수없이 다루었지만, 타입의 이름 짓기 또한 설계에서 중요한 부분이다.
엄선된 타입, 속성, 변수의 이름은 의도를 명확히 하고 코드와 타입의 추상화 수준을 높여준다.

가령, 동물들의 데이터베이스를 구축한다고 가정하면, 이를 표현하기 위한 인터페이스는 다음과 같다.

```ts
interface Animal {
  name: string;
  endangered: boolean;
  habitat: string;
}

const leopard: Animal = {
  name: "Snow Leopard",
  endangered: false,
  habitat: "tundra",
};
```

이 인터페이스에서의 동작은 문제없지만, 네이밍에서 문제 삼을 수 있는 것들이 존재한다.

- name은 매우 일반적인 용어로, 동물의 학명인지 일반적인 명칭인지 알 수 없다.
- endangered 속성의 의도를 '멸종 위기 또는 멸종'으로 생각한 것일지도 모른다.
- 서식지를 나타내는 habitat 속성은 너무 범위가 넓은 string 타입일 뿐아니라, 서식지라는 뜻 자체도 불분명하기 때문에 다른 속성들에 비해 모호하다.
- 객체의 변수명이 leopard이지만, name 속성의 값은 'Snow Leopard'이다. 객체의 이름과 속성의 name이 다른 의도로 사용된 것인지 불분명하다.

반면 다음 코드의 타입 선언은 의미가 분명하다.

```ts
interface Animal {
  commonName: string;
  genus: string;
  species: string;
  status: ConservationStatus;
  climates: KoppenClimate[];
}
type ConservationStatus = "EX" | "EW" | "CR" | "EN" | "VU" | "NT" | "LC";
type KoppenClimate =
  | "Af"
  | "Am"
  | "As"
  | "Aw"
  | "BSh"
  | "BSk"
  | "BWh"
  | "BWk"
  | "Cfa"
  | "Cfb"
  | "Cfc"
  | "Csa"
  | "Csb"
  | "Csc"
  | "Cwa"
  | "Cwb"
  | "Cwc"
  | "Dfa"
  | "Dfb"
  | "Dfc"
  | "Dfd"
  | "Dsa"
  | "Dsb"
  | "Dsc"
  | "Dwa"
  | "Dwb"
  | "Dwc"
  | "Dwd"
  | "EF"
  | "ET";
const snowLeopard: Animal = {
  commonName: "Snow Leopard",
  genus: "Panthera",
  species: "Uncia",
  status: "VU", // 취약종 (vulnerable)
  climates: ["ET", "EF", "Dfd"], // 고산대 또는 아고산대 (alpine or subalpine)
};
```

이 코드는 다음 세 가지를 개선했다.

- name은 commonName, genus, species 등 더 구체적인 용어로 대체했다.
- endangered는 동물 보호 등급에 대한 IUCN의 표준 분류 체계인 ConversationStatus 타입의 status로 변경되었다.
- habitat는 기후를 뜻하는 climates로 변경하여 쾨펜 기후 분류를 사용했다.

데이터를 훨씬 명확하게 표현하고 있으며, 정보를 찾기 위해 사람에 의존할 필요가 없다. 쾨펜 기후 분류 체계를 공부하거나, 동물 보호 상태의
구체적인 의미를 파악하려면, 온라인에서 무수히 많은 정보를 찾을 수 있다.

코드로 표현하고자 하는 모든 분야에는 주제를 설명하기 위한 전문 용어들이 있다. 자체적으로 용어를 만들어 내려고 하지 말고, 해당 분야에 이미
존재하는 용어를 사용해야 한다. 이런 용어들은 오랜기간 다듬어져 왔고, 현장에서 실제로 사용되고 있다. **이런 용어를 사용하면 사용자와 소통에 유리하며 타입의 명확성을 올릴 수 있다.** 하지만, 전문 용어를 사용할 때는 정확하게 사용해야 한다. 특정 용어를 다른 의미로 사용되었을 때 더 큰 혼란을 야기한다.

타입, 속성, 변수에 이름 짓기를 할 때 공통적으로 명심해야 하는 세 가지 규칙이 있다.

- 동일한 의미를 나타낼 때는 같은 용어를 사용해야 한다. 글쓰기, 말하기를 할 때 같은 단어를 반복해서 사용하면 지루할 수 있기 때문에 동의어를 섞어 사용하곤 한다. 하지만, 코드에서는 동의어를 사용하지 않고 일관된 용어를 사용해야 한다.
- data, info, thing, object, entity 같은 모호하고 의미 없는 이름은 피해야 한다. 만약 entity라는 용어가 해당 분야에서 특별한 의미를 가진다면 괜찮지만, 귀찮다고 무심코 의미 없는 이름을 붙여서는 안된다.
- 이름을 지을 때는 포함된 내용이나 계산 방식이 아니라 데이터 자체가 무엇인지 고려해야 한다. 예를 들어 INodeList 보다는 Directory라는 이름 짓기가 필요하다. 구현의 측면이 아니라, 개념적인 측면에서 디렉터리를 생각하게 한다. 좋은 이름은 추상화의 수준을 높이고 의도치 않은 충돌의 위험성을 줄여준다.
