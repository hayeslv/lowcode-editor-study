import { computed } from "vue";

export function useFocus(data, callback) {
  // 获取哪些元素被选中了，哪些没被选中
  const focusData = computed(() => {
    const focus = [];
    const unfocus = [];
    data.value.blocks.forEach(block => (block.focus ? focus : unfocus).push(block));
    return { focus, unfocus };
  });

  const clearBlockFocus = () => {
    data.value.blocks.forEach(block => (block.focus = false));
  };

  const blockMousedown = (e: MouseEvent, block) => {
    e.preventDefault();
    e.stopPropagation();
    // block上我们规划一个属性 focus，获取焦点后就将focus变为true
    if (e.shiftKey) {
      block.focus = !block.focus;
    } else {
      if (!block.focus) {
        // 清空其它的focus属性
        clearBlockFocus();
        block.focus = true;
      } else {
        block.focus = false;
      }
    }

    callback(e);
  };

  return {
    focusData,
    blockMousedown,
    clearBlockFocus,
  };
}
