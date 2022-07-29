import deepcopy from "deepcopy";
import { ElButton } from "element-plus";
import { computed, defineComponent, inject, ref } from "vue";
import { $dialog } from "~/components/Dialog";
import { $dropdown, DropdownItem } from "~/components/Dropdown";
import { useBlockDragger } from "~/hooks/useBlockDragger";
import { useCommand } from "~/hooks/useCommand";
import { useFocus } from "~/hooks/useFocus";
import { useMenuDragger } from "~/hooks/useMenuDragger";
import "~/style/editor.scss";
import EditorBlock from "./EditorBlock";
import EditorOperator from "./EditorOperator";

export default defineComponent({
  props: {
    modelValue: { type: Object, required: true },
  },
  emits: ["update:modelValue"], // 要触发的事件
  setup(props, { emit }) {
    // 预览的时候，内容不能再操作了，可以点击输入内容，方便看效果
    const previewRef = ref(false);
    const editorRef = ref(true);

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
      {
        label: "关闭",
        icon: "icon-close",
        handler: () => {
          editorRef.value = false;
          clearBlockFocus();
        },
      },
    ];

    const onContextMenuBlock = (e, block) => {
      e.preventDefault();

      $dropdown({
        el: e.target, // 以哪个元素为准，产生一个dropdown
        content: () => <>
          <DropdownItem label="删除" icon="icon-delete" {...{ onClick: () => commands.delete() }}></DropdownItem>
          <DropdownItem label="置顶" icon="icon-place-top" {...{ onClick: () => commands.placeTop() }}></DropdownItem>
          <DropdownItem label="置底" icon="icon-place-bottom" {...{ onClick: () => commands.placeBottom() }}></DropdownItem>
          <DropdownItem label="查看" icon="icon-browse" {...{
            onClick: () => {
              $dialog({
                title: "查看节点数据",
                content: JSON.stringify(block),
              });
            },
          }}></DropdownItem>
          <DropdownItem label="导入" icon="icon-import" {...{
            onClick: () => {
              $dialog({
                title: "导入节点数据",
                content: "",
                footer: true,
                onConfirm(text) {
                  text = JSON.parse(text);
                  commands.updateBlock(text, block);
                },
              });
            },
          }}></DropdownItem>
        </>,
      });
    };

    return () => !editorRef.value
      ? <>
        <div
          ref={containerRef}
          class="editor-container-canvas__content"
        >
          {
            data.value.blocks.map((block, index) => (
              <EditorBlock
                key={block}
                block={block}
                class="editor-block-preview"
              ></EditorBlock>
            ))
          }
        </div>
        <div><ElButton type="primary" onClick={() => (editorRef.value = true)}>返回编辑</ElButton></div>
      </>
      : <div class="editor">
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
        <div class="editor-right">
          <EditorOperator block={lastSelectBlock.value} data={data.value}></EditorOperator>
        </div>
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
                      onContextmenu: (e) => onContextMenuBlock(e, block),
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
