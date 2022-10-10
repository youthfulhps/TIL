# Storybook

[스토리북](https://storybook.js.org/)은 앱의 비즈니스 로직, 데이터 및 컨텍스트와 별도로 
UI 구성 요소를 구축하고 테스트, QA를 지원한다.

스토리북이 UI 개발에 가져다주는 이점은 확실하다.

- 컴포넌트 단위의 단위 테스트 레벨을 책임지도록 할 수 있다.
- 컴포넌트 UI 개발 단계에서 작업물을 확인하기 위한 플레이 그라운드로 사용할 수 있다.
- 기획, QA 레벨과의 공유와 커뮤니케이션 리소스를 최소화할 수 있다.

## 설치와 실행

스토리북에서 재공하는 스크립트를 통해 필요한 설정과 예제로 확인할 수 있는 문서와 컴포넌트 스토리북이
추가되며, 실행 명령어가 자동으로 추가된다.

```shell
~$ npx storybook init
```

```shell
~$ yarn storybook
```

## .storybook

스토리북의 코어 설정들이 담겨있는 파일들로 구성되어 있다.

### .storybook/main.js

`.storybook/main.js` 생성된 초기 파일은 다음과 같은데, 초기에 추가나 수정이 필요한
부분은 `stories`, `addons` 이다.

`stories`는 스토리북을 빌드할 때 타겟이 되는 파일들의 형식을 가진다.
기본적으로 스토리북 문서를 위한 `stories.mdx`와 컴포넌트 스토리북을 위한 `stories.@(js|jsx|ts|tsx)`
가 설정되어 있다. 

`addons`은 스토리북을 작성할 때 필요한 [플러그인](https://storybook.js.org/docs/react/addons/introduction)
들이라고 이해하면 쉽다. 스토리북을 더욱 그럴싸하게 꾸며보고 싶다면, 필요한 에드온을 추가해서
설정해주면 된다.

```js
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-create-react-app"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-webpack5"
  }
}
```

특정 파일(scss, svg, woff2..)들을 처리해주기 위해 웹팩 설정을 해주어야 한다면,
`webpackFinal`에서 설정을 처리해주면 된다. 

```js
module.exports = {
  "stories": [],
  "addons": [],
  webpackFinal: async config => {
    // alias path 설정 
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '..'),
      //...
    };
    
    // inline svg 파일 처리
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test && rule.test.test(".svg")
    );
    fileLoaderRule.exclude = /\.svg$/;

    config.module.rules.push({
      test: /\.svg$/,
      enforce: "pre",
      loader: require.resolve("@svgr/webpack")
    });
    
    // scss 파일 처리
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        "style-loader",
        'css-loader',
        'resolve-url-loader',
        "sass-loader"
      ],
      include: path.resolve(__dirname, "../"),
    });

    // woff, woff2 폰트 파일 처리
    config.module.rules.push({
      test: /\.(woff|woff2)$/,
      use: ["file-loader"],
      include: path.resolve(__dirname, "../"),
    });

    // 정적 파일 루트 경로 설정
    config.resolve.roots = [
      path.resolve(__dirname, '../public'),
      'node_modules',
    ];
    return config
  }
}
```


### .storybook/preview.js

`.storybook/preview.js` 생성된 초기 파일은 다음과 같다. `main.js`는 스토리북의
전역적인 설정들을 위한 파일이라면, `preview.js`는 컴포넌트가 스토리북에서 랜더링되기 위한
의존성(?)들을 주입하기 위한 설정같다.

```js
export const decorators = [
  (Story) => (
    <Provider store={store}>
      <ContextProvider>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <Story />
        </ThemeProvider>
      </ContextProvider>
    </Provider>
  )
]

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
```
`decorators`는 가령 스토어나 컨텍스트의 의존성을 주입하거나, styled-components의 전역 스타일을 
주입하는 것과 같이 스토리북이 랜더링되기 위해 필요한 상위 컴포넌트들을 래핑해줄 때 사용된다. 

`parameters`는 스토리북에서 속성들을 컨트롤하거나, 클릭과 같은 액션에 대해 필요한 기본적인 처리방식을
추가할 수 있다.

## 스토리북 문서

제품 스토리북 소개, 디자인 토큰들을 정리하기 위한 문서를 작성할 수 있다. 그냥 작성되는 건 아니고
mdx 파일을 파싱하기 위한 에드온이 필요한데, 초기에 추가되어 있는 에드온에 포함되어 있다.

본 섹션은 설명을 하기 보다는, 초기에 예제로 추가되는 `stories/introduction.stroies.mdx`
파일을 보면서 `mdx` 문법을 대략 이해하면 쉽게 작성할 수 있다.

## 컴포넌트 스토리북

버튼 스토리북 예제이다. 파일 config를 설정하고, 컴포넌트를 템플릿으로 내보내면
각각의 스토리북 문서가 작성된다.

```jsx
import React from 'react';

import { Button } from './Button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  primary: true,
  label: 'Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Button',
};
``` 

사실, 컴포넌트 스토리북을 작성하는 것도 크게 어렵지는 않다. 다만, 입맛에 맞게 수정하거나,
고도화를 위해 시도했던 작업들을 정리해보자.

1. 컴포넌트 특정 prop의 컨트롤의 사용성을 개선한다.

argTypes에는 props 각각의 설정을 커스텀할 수 있다. 가령, backgroundColor 컨트롤을
`#ffffff`와 같은 hex 문자열로 전달받아도 좋지만, 색상 파레트로 입력받을 수 있으면 좋을 것 같다면
아래와 같이 `control: 'color'` 속성을 주어 스토리북에서 제공하는 컨트롤을 커스텀할 수 있다.

<img src="./images/control-color.png" width="100%" />

```jsx
export default {
  title: 'Example/Button',
  component: Button,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};
```

반면, 복잡하게 컨트롤이 필요하지 않다면, 비활성화 할 수 있다.

<img src="./images/control-disable.png" width="100%" />

```jsx
export default {
  title: 'Example/Button',
  component: Button,
  argTypes: {
    backgroundColor: { 
      control: {
        disable: true,
      }  
    },
  },
};
```

2. 컴포넌트 특정 prop의 테이블을 제거한다.

컴포넌트 특정 prop에 대해 아예 노출을 시키고 싶지 않다면, table에서 비활성화 할 수 있다.

```jsx
    export default {
  title: 'Example/Button',
  component: Button,
  argTypes: {
    backgroundColor: {
      table: {
        disable: true,
      }
    }
  },
};
```

3. 컴포넌트에서 의존적으로 변경되는 상태값을 관리할 수 있다.

가령, `useState`와 같이 스토리북 내에서 직접 컨트롤할 수 있는 상태값을 관리하고 싶다면,
[@storybook/client-api](https://www.npmjs.com/package/@storybook/client-api)에서
제공하는 `useArgs`를 사용할 수 있다.

스토리북은 기본적으로 타입 기반으로 `prop`의 성질을 구해 컨트롤을 결정하는 듯한데,
`useState` 훅의 반환값으로 제공되는 `setState`의 경우 타입 기반으로 캐치되면 스토리북에서
적절한 컨트롤이 불가능하다.

아래와 같이, `DatePicker` 컴포넌트에서 스토리북에서 랜더링된 컴포넌트를 날짜를 클릭하면,
`selectedDate`가 업데이트되도록 하기 위해서 `useArgs`를 아래와 같이 사용할 수 있다.


```jsx
import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useArgs } from '@storybook/client-api';
import DatePicker from '.';

export default {
  title: 'Designs/common/DatePicker',
  component: DatePicker,
  args: {
    selectedDate: new Date(),
  },
  argTypes: {
    setSelectedDate: {
      control: {
        disable: true,
      },
    },
  },
} as ComponentMeta<typeof DatePicker>;

const Template: ComponentStory<typeof DatePicker> = (args) => {
  const [ {
    selectedDate,
  }, updateArgs ] = useArgs();

  const setSelectedDate = (date: Date) => {
    updateArgs({
      selectedDate: date,
    });
  };

  return (
    <DatePicker
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
    />
  );
};

export const Default = Template.bind({});
```












