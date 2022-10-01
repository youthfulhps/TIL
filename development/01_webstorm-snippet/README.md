# Webstorm snippet

## WebStorm에서 자주 사용하는 파일 템플릿 정의

_Preference > Editor > Live Templates > React > +_

![Example live templates for React](./images/live-templates.png)


### (1) snippet 호출 명령어를 설정한다.
snippet 호출을 위한 명령어를 설정한다. 설정된 명령어는 코드 파일에서 추천 명령어로 등장한다.

### (2) snippet 설명을 작성한다.
snippet 명령어의 설명을 작성한다.

### (3) snippet template을 작성한다.

`ejs` 문법과 동일하게 $~$를 통해 시스템 혹은 작성된 변수가 적용된다.

### (4) snippet template에서 사용할 변수를 설정한다.

`$TM_FILENAME_BASE$`는 다음과 같이 설정된다. Expression에는 다양한 표현식들이 설정되어 있다.

![Edit template variables](./images/edit-variables.png)

### (5) 설정된 snippet 명령어 파일 영역을 설정한다.

snippet 명령어가 특정 파일 포맷에서만 등장할 수 있도록 설정한다. 가령 리엑트의 경우 Javascript and Typescript로 설정할 수 있다.

<img src="./images/applicable-in-specific-file-fomat.png" width="250">

### 사용 예시

![Example snippet template usage](./images/usage-example.png)









