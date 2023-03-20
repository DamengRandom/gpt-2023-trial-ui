import { create } from "zustand";

export default create((set) => ({
  answers: [],
  currentQuery: "",
  showOrHide: false,
  toggleShowHide: (toggleValue) => set({ showOrHide: toggleValue }),
  setCurrentQuery: (text) => set({ currentQuery: text }),
  addAnswers: (newAnswer) =>
    set((state) => ({ answers: [...state.answers, newAnswer] })),
}));
