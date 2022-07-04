import { computed, defineComponent, inject } from "vue";
import "~/style/editor.scss";
import EditorBlock from "./EditorBlock";

export default defineComponent({
  props: {
    data: { type: Object, required: true },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const data = computed(() => {
      return props.data;
    });

    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));
    return { containerStyles };
  },
  render() {
    const config: any = inject("config");

    return <div class="editor">
      <div class="editor-left">
        {/* 根据注册列表，渲染对应的内容 */}
        {config.componentList.map(component => (
          <div class="editor-left-item">
            <span>{component.label}</span>
            <div>{component.preview()}</div>
          </div>
        ))}
      </div>
      <div class="editor-top">菜单栏</div>
      <div class="editor-right">属性控制栏</div>
      <div class="editor-container">
        {/* 负责产生滚动条（页面比较长的情况下） */}
        <div class="editor-container-canvas">
          {/* 内容区域 */}
          <div class="editor-container-canvas__content" style={this.containerStyles}>
            {
              this.data.blocks.map(block => (
                <EditorBlock block={block}></EditorBlock>
              ))
            }
          </div>
        </div>
      </div>

    </div>;
  },
});
