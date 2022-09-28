# unicode-range

최근 꽤나 당황스러웠던 기획 중 하나가, '한글에만 스포카산스네오, 영어, 특수문자는 BrownLL 적용해주세요!' 였다.
[스포카산스네오](https://spoqa.github.io/spoqa-han-sans/ko-KR/)는 모든 유니코드에 적용가능한
폰트였고, 우선순위를 가지고 있는 스포카산스네오 폰트가 먼저 적용될텐데, 특정 유니코드만 다른 폰트를 어떻게 적용할 수 있을 까 난감했다.

```css
font-family: 'Spoqa Han Sans Neo', 'BrownLL', 'sans-serif'; 
```

감사하게도 `unicode-range` 라는 속성값이 있었다. 유니코드의 범위를 지정하고, 그 범위에 속하는 텍스트에
폰트를 적용한다.

```text
전체 : U+0020-007E
특수문자 : U+0020-002F, U+003A-0040, U+005B-0060, U+007B-007E
국문 : U+AC00-D7A3
영문 : U+0041-005A(대문자), U+0061-007A(소문자)
숫자 : U+0030-0039
```

```scss
@font-face {
  font-family: 'Spoqa Han Sans Neo';
  font-style: normal;
  font-weight: 400;
  src: url('/fonts/SpoqaHanSansNeo/SpoqaHanSansNeo-Thin.woff2') format('woff2'), 
       url('/fonts/SpoqaHanSansNeo/SpoqaHanSansNeo-Thin.woff') format('woff');
  unicode-range: U+AC00-D7A3; //For Korean
}

@font-face {
  font-family: 'BrownLL';
  font-style: normal;
  font-weight: 400;
  src: url('/fonts/BrownLL/BrownLLWeb-Regular.woff2') format('woff2'),
       url('/fonts/BrownLL/BrownLLWeb-Regular.woff') format('woff');
}
```

사실, `unicode-range`의 주된 목적은 UI 컨텐츠 상에서 폰트페이스에 지정된 유니코드 범위내에 등록된 텍스트가
없으면, 폰트 다운로드 요청을 하지 않는다고 한다. 웹 페이지를 로딩하는 과정에서 폰트를 선택적으로 다운로드하게
되, 폰트 다운로드 비용을 최적화할 수 있는 장점이 있다.

## Reference

[웹 폰트 사용과 최적화의 최근 동향](https://d2.naver.com/helloworld/4969726)



