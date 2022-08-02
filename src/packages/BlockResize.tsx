import { defineComponent } from "vue";

export default defineComponent({
  props: {
    block: { type: Object },
    component: { type: Object },
  },
  setup(props) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const { width, height } = props.component.resize || {};
    let data: any = {};

    const onmousemove = (e: MouseEvent) => {
      let { clientX, clientY } = e;
      const { startX, startY, startWidth, startHeight, startLeft, startTop, direction } = data;

      // 上下两个点，宽度不变化
      if (direction.horizontal === "center") {
        clientX = startX;
      }
      // 左右两个点，高度不变化
      if (direction.vertical === "center") {
        clientY = startY;
      }

      let durX = clientX - startX; // 移动的宽度
      let durY = clientY - startY; // 移动的高度

      // 水平（从左往右）是start（左边）
      if (direction.vertical === "start") {
        durY = -durY;
        props.block.top = startTop - durY;
      }
      // 垂直（从上往下）是start（上边）
      if (direction.horizontal === "start") {
        durX = -durX;
        props.block.left = startLeft - durX;
      }

      // 修改后的宽高
      const width = startWidth + durX;
      const height = startHeight + durY;
      // 拖拽的时候，改变了宽高
      props.block.width = width;
      props.block.height = height;
      props.block.hasResize = true;
    };
    const onmouseup = () => {
      document.body.removeEventListener("mousemove", onmousemove);
      document.body.removeEventListener("mouseup", onmouseup);
    };
    const onmousedown = (e: MouseEvent, direction) => {
      e.stopPropagation();

      data = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: props.block.width,
        startHeight: props.block.height,
        startLeft: props.block.left,
        startTop: props.block.top,
        direction,
      };

      document.body.addEventListener("mousemove", onmousemove);
      document.body.addEventListener("mouseup", onmouseup);
    };

    return () => <>
      {width && <>
        <div class="block-resize block-resize-left"
          onMousedown={e => onmousedown(e, { horizontal: "start", vertical: "center" })}
        ></div>
        <div class="block-resize block-resize-right"
          onMousedown={e => onmousedown(e, { horizontal: "end", vertical: "center" })}
        ></div>
      </>}
      {height && <>
        <div class="block-resize block-resize-top"
          onMousedown={e => onmousedown(e, { horizontal: "center", vertical: "start" })}
        ></div>
        <div class="block-resize block-resize-bottom"
          onMousedown={e => onmousedown(e, { horizontal: "center", vertical: "end" })}
        ></div>
      </>}
      {width && height && <>
        <div class="block-resize block-resize-top-left"
          onMousedown={e => onmousedown(e, { horizontal: "start", vertical: "start" })}
        ></div>
        <div class="block-resize block-resize-top-right"
          onMousedown={e => onmousedown(e, { horizontal: "end", vertical: "start" })}
        ></div>
        <div class="block-resize block-resize-bottom-left"
          onMousedown={e => onmousedown(e, { horizontal: "start", vertical: "end" })}
        ></div>
        <div class="block-resize block-resize-bottom-right"
          onMousedown={e => onmousedown(e, { horizontal: "end", vertical: "end" })}
        ></div>
      </>}
    </>;
  },
});
