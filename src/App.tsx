import { defineComponent, provide, ref, watch } from "vue";
import data from "~/data.json";
import Editor from "./packages/Editor";
import "~/style/index.scss";
import { registorConfig as config } from "~/utils/editor-config";

export default defineComponent({
  setup() {
    const state = ref(data);

    provide("config", config); // 将组件的配置直接传入

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
