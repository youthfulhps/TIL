import { selector } from "recoil";
import { textState } from "../atoms/text";

export const textCountState = selector({
  key: "textCountState",
  get: ({ get }) => {
    const text = get(textState);

    return text.length;
  },
});
