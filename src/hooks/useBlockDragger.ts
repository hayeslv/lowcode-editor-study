export function useBlockDragger(focusData) {
  // 实现获取焦点后，选中后可以直接拖拽了
  let dragState: any = {
    startX: 0,
    startY: 0,
  };
  const mousedown = (e: MouseEvent) => {
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      // 记录当前全部聚焦元素的位置
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
    };

    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };
  const mousemove = (e: MouseEvent) => {
    const { clientX: moveX, clientY: moveY } = e;
    // 移动后的距离 - 移动前的距离
    const durX = moveX - dragState.startX;
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
  };

  return { mousedown };
}
