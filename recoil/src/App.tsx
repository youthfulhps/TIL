import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { useRecoilState, useRecoilValue } from "recoil";
import { textState } from "./states/atoms/text";
import { textCountState } from "./states/selectors/text";

function App() {
  const [text, setText] = useRecoilState(textState);
  const count = useRecoilValue(textCountState);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };
  return (
    <div className="App">
      <h1>{text}</h1>
      <h2>count: {count}</h2>
      <input type="text" onChange={handleChangeInput} />
    </div>
  );
}

export default App;
