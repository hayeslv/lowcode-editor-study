import { defineComponent, ref, watch } from "vue";
import data from "~/data.json";
import Editor from "./packages/Editor";
import "~/style/index.scss";

export default defineComponent({
  setup() {
    const state = ref(data);

    // watch(() => state.value, () => {
    //   console.log(state.value);
    // }, { deep: true });

    return { state };
  },
  render() {
    return <div class="app">
      {/* 指定值，修饰符 */}
      {/* <Editor v-model={[this.state, "data", ["trim"]]} ></Editor> */}
      <Editor data={this.state} {...{ "onUpdate:modelValue": (data) => (this.state = data) }}></Editor>
    </div>;
  },
});
