import deepcopy from "deepcopy";
import { computed, defineComponent, inject, ref } from "vue";
import { $dialog } from "~/components/Dialog";
import { useBlockDragger } from "~/hooks/useBlockDragger";
import { useCommand } from "~/hooks/useCommand";
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
    // 预览的时候，内容不能再操作了，可以点击输入内容，方便看效果
    const previewRef = ref(false);

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
    const { focusData, lastSelectBlock, blockMousedown, containerMousedown, clearBlockFocus } = useFocus(data, previewRef, (e) => {
      mousedown(e);
    });
    const { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data);

    const { commands } = useCommand(data, focusData);
    const buttons = [
      { label: "撤销", icon: "icon-back", handler: () => commands.undo() },
      { label: "重做", icon: "icon-forward", handler: () => commands.redo() },
      {
        label: "导出",
        icon: "icon-export",
        handler: () => {
          $dialog({
            title: "导出json",
            content: JSON.stringify(data.value),
          });
        },
      },
      {
        label: "导入",
        icon: "icon-import",
        handler: () => {
          $dialog({
            title: "导入json",
            content: "",
            footer: true,
            onConfirm(text) {
              // data.value = JSON.parse(text); // 这样更改无法保存历史记录
              commands.updateContainer(JSON.parse(text));
            },
          });
        },
      },
      { label: "置顶", icon: "icon-place-top", handler: () => commands.placeTop() },
      { label: "置底", icon: "icon-place-bottom", handler: () => commands.placeBottom() },
      { label: "删除", icon: "icon-delete", handler: () => commands.delete() },

      {
        label: () => previewRef.value ? "编辑" : "预览",
        icon: () => previewRef.value ? "icon-edit" : "icon-browse",
        handler: () => {
          previewRef.value = !previewRef.value;
          clearBlockFocus();
        },
      },
    ];

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
      <div class="editor-top">
        {buttons.map((btn, index) => {
          const icon = typeof btn.icon === "function" ? btn.icon() : btn.icon;
          const label = typeof btn.label === "function" ? btn.label() : btn.label;
          return <div class="editor-top-button" onClick={btn.handler}>
            <i class={icon}></i>
            <span>{label}</span>
          </div>;
        })}
      </div>
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
                  key={block}
                  class={[
                    block.focus ? "editor-block-focus" : "",
                    previewRef.value ? "editor-block-preview" : "",
                  ]}
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
