import { reactive } from "vue";

export function useBlockDragger(focusData, lastSelectBlock, data) {
  // 实现获取焦点后，选中后可以直接拖拽了
  let dragState: any = {
    startX: 0,
    startY: 0,
  };
  const markLine = reactive({
    x: null,
    y: null,
  });
  const mousedown = (e: MouseEvent) => {
    const { width: BWidth, height: BHeight } = lastSelectBlock.value; // 拖拽最后的元素

    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: lastSelectBlock.value.left, // B点拖拽前的left和top
      startTop: lastSelectBlock.value.top,
      // 记录当前全部聚焦元素的位置
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
      lines: (() => {
        const { unfocus } = focusData.value; // 获取其他没选中的，以他们的位置做辅助线

        const lines = { x: [], y: [] }; // x:纵向的线（距离左方的大小），y：横向的线（距离上方的大小）
        [
          ...unfocus, // 未选中元素
          { top: 0, left: 0, width: data.value.container.width, height: data.value.container.height }, // 整个容器
        ].forEach(block => {
          // B正在拖动时，就可能与A发生关系
          const { top: ATop, left: ALeft, width: AWidth, height: AHeight } = block;
          // 1、A顶对B顶：当B元素拖拽到与A元素top一致时，显示这根辅助线，辅助线的位置就是ATop
          lines.y.push({ showTop: ATop, top: ATop });
          // 2、A顶对B底：top为B当前的top
          lines.y.push({ showTop: ATop, top: ATop - BHeight });
          // 3、A中对B中
          lines.y.push({ showTop: ATop + AHeight / 2, top: ATop + AHeight / 2 - BHeight / 2 });
          // 4、A底对B顶
          lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight });
          // 5、A底对B底
          lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight - BHeight });

          // x的5种情况
          // 1、A左对B左
          lines.x.push({ showLeft: ALeft, left: ALeft });
          // 2、A右对B左
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth });
          // 3、A中对B中
          lines.x.push({ showLeft: ALeft + AWidth / 2, left: ALeft + AWidth / 2 - BWidth / 2 });
          // 4、A右对B右
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth - BWidth });
          // 5、A左对B右
          lines.x.push({ showLeft: ALeft, left: ALeft - BWidth });
        });

        return lines;
      })(),
    };

    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };
  const mousemove = (e: MouseEvent) => {
    let { clientX: moveX, clientY: moveY } = e;

    // 计算当前元素最新的left和top，去线里面找到，然后显示这条线
    // 最新的left = 鼠标移动后 - 鼠标移动前 + left
    const left = moveX - dragState.startX + dragState.startLeft;
    const top = moveY - dragState.startY + dragState.startTop;
    // 和线进行对比
    // 先计算横线，距离参照物元素还有5px的时候，就显示这条线
    let y = null;
    let x = null;
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: t, showTop: s } = dragState.lines.y[i]; // 获取每一根线
      if (Math.abs(t - top) < 5) { // 小于5，说明接近了
        y = s; // 线要显示的位置

        // 实现快速贴边
        moveY = dragState.startY - dragState.startTop + t; // 容器距离顶部的距离 + 目标的高度，就是最新的moveY
        break; // 找到一根线后，就跳出循环
      }
    }
    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { left: l, showLeft: s } = dragState.lines.x[i]; // 获取每一根线
      if (Math.abs(l - left) < 5) { // 小于5，说明接近了
        x = s; // 线要显示的位置

        // 实现快速贴边
        moveX = dragState.startX - dragState.startLeft + l; // 容器距离顶部的距离 + 目标的高度，就是最新的moveX
        break; // 找到一根线后，就跳出循环
      }
    }
    // markLine 是一个响应式数据，x或y更新了会导致视图更新
    markLine.x = x;
    markLine.y = y;

    // 移动后的距离 - 移动前的距离
    const durX = moveX - dragState.startX; // 之前和之后的距离
    const durY = moveY - dragState.startY;
    // 修改位置
    focusData.value.focus.forEach((block, index) => {
      // 元素的top等于以前的top + 移动的top
      block.top = dragState.startPos[index].top + durY;
      block.left = dragState.startPos[index].left + durX;
    });
  };
  const mouseup = (e) => {
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);

    markLine.x = null;
    markLine.y = null;
  };

  return { mousedown, markLine };
}
