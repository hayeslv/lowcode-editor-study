import { defineComponent, provide, ref, watch } from "vue";
import data from "~/data.json";
import Editor from "./packages/Editor";
import "~/style/index.scss";
import { registorConfig as config } from "~/utils/editor-config";

export default defineComponent({
  setup() {
    const state = ref(data);

    provide("config", config); // 将组件的配置直接传入

    const formData = ref({
      username: "hayeslv",
      password: 123,
    });

    return { state, formData };
  },
  render() {
    return <div class="app">
      {/* 指定值，修饰符 */}
      {/* <Editor v-model={[this.state, "data", ["trim"]]} ></Editor> */}
      <Editor modelValue={this.state} formData={this.formData} {...{ "onUpdate:modelValue": (data) => (this.state = data) }}></Editor>
    </div>;
  },
});
