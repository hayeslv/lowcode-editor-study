import deepcopy from "deepcopy";
import { computed, defineComponent, inject, ref } from "vue";
import { useBlockDragger } from "~/hooks/useBlockDragger";
import { useFocus } from "~/hooks/useFocus";
import { useMenuDragger } from "~/hooks/useMenuDragger";
import "~/style/editor.scss";
import EditorBlock from "./EditorBlock";

export default defineComponent({
  props: {
    modelValue: { type: Object, required: true },
  },
  emits: ["update:modelValue"], // 要触发的事件
  setup(props, { emit }) {
    const config: any = inject("config");
    const data = computed({
      get() {
        return  props.modelValue;
      },
      set(newValue) {
        emit("update:modelValue", deepcopy(newValue));
      },
    });

    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));

    const containerRef = ref(null);

    // 实现菜单的拖拽功能
    const { dragstart, dragend } = useMenuDragger(containerRef, data);

    // 获取焦点后，进行拖拽
    const { focusData, lastSelectBlock, blockMousedown, containerMousedown } = useFocus(data, (e) => {
      mousedown(e);
    });
    const { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data);

    // 实现拖拽多个元素

    return () => <div class="editor">
      <div class="editor-left">
        {/* 根据注册列表，渲染对应的内容 */}
        {config.componentList.map(component => (
          <div
            class="editor-left-item"
            draggable
            onDragstart={e => dragstart(e, component)}
            onDragend={dragend}
          >
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
          <div
            ref={containerRef}
            class="editor-container-canvas__content"
            style={containerStyles.value}
            onMousedown={containerMousedown}
          >
            {
              data.value.blocks.map((block, index) => (
                <EditorBlock
                  class={block.focus ? "editor-block-focus" : "" }
                  block={block}
                  {...{
                    onMousedown: (e: MouseEvent) => blockMousedown(e, block, index),
                  }}
                ></EditorBlock>
              ))
            }

            { markLine.x !== null && <div class="line-x" style={{ left: markLine.x + "px" }}></div> }
            { markLine.y !== null && <div class="line-y" style={{ top: markLine.y + "px" }}></div> }
          </div>
        </div>
      </div>

    </div>;
  },
});
