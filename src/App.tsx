import { defineComponent, ref } from "vue";
import data from "~/data.json";
import Editor from "./packages/editor";

export default defineComponent({
  setup() {
    const state = ref(data);

    return { state };
  },
  render() {
    return <div class="app">
      <Editor data={this.state}></Editor>
    </div>;
  },
});
