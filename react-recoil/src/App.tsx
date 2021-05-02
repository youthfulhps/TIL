import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { useRecoilState } from "recoil";
import { textState } from "./atoms/text";

function App() {
  const [text, setText] = useRecoilState(textState);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };
  return (
    <div className="App">
      <h1>{text}</h1>
      <input type="text" onChange={handleChangeInput} />
    </div>
  );
}

export default App;
