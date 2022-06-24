import { defineComponent } from "vue";
import "~/style/editor.scss";

export default defineComponent({
  props: {
    data: { type: Object },
  },
  setup() {},
  render() {
    return <div class="editor">
      <div class="editor-left">左侧物料区</div>
      <div class="editor-top">菜单栏</div>
      <div class="editor-right">属性控制栏</div>
      <div class="editor-container">
        {/* 负责产生滚动条（页面比较长的情况下） */}
        <div class="editor-container-canvas">
          {/* 内容区域 */}
          <div class="editor-container-canvas__content">
            内容区
          </div>
        </div>
      </div>

    </div>;
  },
});
