# react-native 개발 환경 설정

### 1. react-native 설치

https://github.com/react-native-community/cli

```shell
~$ npm install -g react-native-cli
~$ react-native --version
```

### 2. Xcode 설치 혹은 업데이트

https://apps.apple.com/kr/app/xcode/id497799835?mt=12

### 3. cocoapods 설치

```shell
~$ brew install cocoapods
~$ pod --version
```

### 4. 17버전 JDK 설치

https://adoptium.net/temurin/releases/?os=mac&version=17

(m1 -> arch64, intel -> x64)

### 5. JAVA_HOME 환경 변수 설정

```shell
~$ vim ~/.zshrc
```

아래 환경 변수 추가 후 저장

```shell
# JDK
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
```

```shell
~$ source ~/.zshrc # 새고로침
~$ echo $JAVA_HOME # 변경 확인
```

### 6. Android Studio 설치

https://developer.android.com/studio

+ SDK Platform, SDK Tools 설치

### 7. ANDROID_HOME 환경 변수 설정

```shell
~$ vim ~/.zshrc
```

아래 환경 변수 추가 후 저장

```shell
# ANDROID_STUDIO
export ANDROID_HOME=[안드로이드 SDK 위치]
# ex) export ANDROID_HOME=/Users/dwkim584-fastfive/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

```shell
~$ source ~/.zshrc # 새고로침
~$ echo ANDROID_HOME # 변경 확인
```

### 8. react-native 프로젝트 생성

```shell
~$ npx react-native init FirstApp
~$ cd ios
~$ bundle install (only once)
~$ bundle exec pod install (only once)

~$ npm start
```








