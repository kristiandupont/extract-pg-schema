import DefaultTheme from "vitepress/theme";
import TypeBlock from "./TypeBlock.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("TypeBlock", TypeBlock);
  },
};
