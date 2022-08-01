import { GlobalEvent } from "~/config/global";
import { events } from "./../plugins/events";
export function useMenuDragger(containerRef, data) {
  let currentComponent = null;

  const containerMethods = {
    // dragenter：进入元素，添加一个移动的标识
    dragenter: (e: DragEvent) => {
      e.dataTransfer.dropEffect = "move";
    },
    // dragover：在目标元素经过，必须要阻止默认行为，否则不能触发drop
    dragover: (e: DragEvent) => {
      e.preventDefault();
    },
    // dragleave：离开元素的时候，需要增加一个禁用标识
    dragleave: (e: DragEvent) => {
      e.dataTransfer.dropEffect = "none";
    },
    // drop：松手的时候，根据拖拽的组件，添加一个组件
    drop: (e: DragEvent) => {
      const blocks = data.value.blocks; // 内部已经渲染的组件
      // 新增一个组件
      data.value = {
        ...data.value,
        blocks: [
          ...blocks,
          {
            key: currentComponent.key,
            top: e.offsetY,
            left: e.offsetX,
            zIndex: 1,
            alignCenter: true,
            props: {},
            model: {},
          },
        ],
      };

      currentComponent = null;
    },
  };

  const dragstart = (e: DragEvent, component) => {
    containerRef.value.addEventListener("dragenter", containerMethods.dragenter);
    containerRef.value.addEventListener("dragover", containerMethods.dragover);
    containerRef.value.addEventListener("dragleave", containerMethods.dragleave);
    containerRef.value.addEventListener("drop", containerMethods.drop);

    currentComponent = component;

    events.emit(GlobalEvent.Dragstart);
  };
  const dragend = (e: DragEvent) => {
    containerRef.value.removeEventListener("dragenter", containerMethods.dragenter);
    containerRef.value.removeEventListener("dragover", containerMethods.dragover);
    containerRef.value.removeEventListener("dragleave", containerMethods.dragleave);
    containerRef.value.removeEventListener("drop", containerMethods.drop);

    events.emit(GlobalEvent.Dragend);
  };

  return { dragstart, dragend };
}
