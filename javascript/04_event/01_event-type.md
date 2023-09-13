## 이벤트 타입

_다양한 이벤트 타입들이 있다. 그 중에서 자주 사용하지 않았지만 차이와 특징에 대해 기억해두면 좋을 것들을 정리한다._

브라우저는 처리해야 할 특정 사건이 발생하면 이를 감지하여 이벤트를 발생시킨다. 클릭, 키보드 입력 마우스 이동 등이 이벤트의 예시인데, 브라우저는 각각의 이벤트에 
따라 특정한 타입의 이벤트를 발생시킨다.

이벤트 발생에 따라 호출될 함수를 **이벤트 핸들러**라고 하며, 이벤트가 발생했을 때 이벤트 핸들러의 호출을 브라우저에게 위임할 수 있는데 이를 **이벤트 핸들러 등록**이라 한다.

각각의 요소, 가령 <button>과 같은 요소들은 이벤트 핸들러 프로퍼티들을 가지고 있다. 이벤트 핸들러 프로퍼티에 함수를 할당하면 해당 이벤트가 발생했을 때 할당한 
함수가 브라우저에 의해 호출된다. 이와 같이 프로그램의 흐름을 이벤트 중심으로 제어하는 프로그래밍 방식을 **이벤트 드리븐 프로그래밍**이라 한다.

### 마우스 이벤트

1. mouseleave, mouseenter, mouseout, mouseover는 마우스 커서가 HTML 요소 밖으로 혹은 안으로 이동했을 때 발생하는 이벤트이다. mouseleave와
mouseout은 동일한 액션의 이벤트를 트래킹하지만, **mouseleave는 이벤트 버블링이 발생하지 않는다. 반대로 mouseout은 버블링이 발생한다.** 마찬가지로
mouseenter와 mouseover는 동일한 액션의 이벤트를 트래킹하지만, mouseenter는 이벤트 버블링이 발생하지 않는다. 반대로 mouseover는 버블링이 발생한다.

(mouseleave, mouseenter는 버블링이 발생하지 않음, mouseout, mouseover는 버블링이 발생함)

### 키보드 이벤트

1. keypress, deprecated 되었다. 되도록이면 keydown, keyup 이벤트 타입을 사용하는 것을 권장한다.
2. keydown, 키를 눌렀을 때 발생하는 이벤트이다. 문자, 숫자, 특수문자, enter 키를 눌렀을 때는 연속적으로 발생하나, 그 외 키를 눌렀을때는 한번만 발생한다.
3. keyup, 누르고 있던 키를 놓았을 때 한번만 발생한다. (누르고 있던 키를 놓는 과정은 물리적으로 단일인 것과 같다.)

### 포커스 이벤트

1. focus, blur, HTML 요소가 포커스를 받거나 잃었을 때 발생하게 되는 이벤트이다. 다만 버블링이 발생하지 않는다. 
2. focusin, focusout, 위와 동일한 액션의 이벤트를 발생시키지만 버블링된다. 
   - * focusin, focusout은 HTML 요소 프로퍼티에 이벤트 핸들러를 할당하는 방식으로는 정상 동작하지 않는다. addEventListener 메서드 방식으로 등록해야 한다.

### 폼 이벤트

1. submit, form 요소 내의 input (text, checkout, radio), select 입력 필드에서 엔터키를 눌렀을 때 발생한다.
   - * textarea는 줄바꿈을 위한 엔터키 사용이 발생할 수 있어 submit 이벤트 발생 요소에서 제외된다.
2. submit, 이벤트 폼 요소 내의 버튼 (<button>, <input type='submit'>)을 클릭했을 때 form 요소에서 발생한다.

### 값 변경 이벤트

1. input, input 요소에 값이 입력될 때 발생한다. 유사하게 change는 input 요소의 값이 변경될 때 발생한다.
2. readystatechange, HTML 문서의 로드와 파싱 상태를 나타내는 document.readyState (loading, interactive, complete) 프로퍼티 값이 변경될 때 발생한다.

### DOM 뮤테이션 이벤트

1. DOMContentLoaded, HTML 문서의 로드와 파싱이 완료되어 DOM 생성이 완료되었을 때 발생한다.

### 뷰 이벤트

1. resize, 오직 window 객체에서만 발생한다. 때문에 당연하게 이벤트 핸들러 또한 window에만 할당 가능하다.
2. scroll, document 혹은 HTML 요소를 스크롤할 때 연속적으로 발생한다.

### 리소스 이벤트

1. load, DOMContentLoaded 이벤트 발생 이후, 모든 리소스 (이미지, 폰트 등)의 로딩이 완료되었을 때 발생한다.
2. unload, 리소스가 언로드되었을 때 발생한다. 주로, 페이지 이탈할 경우.
3. abort, 리소스 로딩이 중단되었을 때 발생한다.
4. error, 리소스 로딩이 실패했을 때 발생한다.







