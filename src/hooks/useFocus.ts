import { computed, ref } from "vue";

export function useFocus(data, callback) {
  // 当前选中的元素，默认-1：没有任何元素被选中
  const selectIndex = ref(-1);
  // 最后一个选中的元素（对齐线以最后一个元素为基准）
  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);

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

  const containerMousedown = () => {
    clearBlockFocus();
    selectIndex.value = -1;
  };

  const blockMousedown = (e: MouseEvent, block, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    // block上我们规划一个属性 focus，获取焦点后就将focus变为true
    if (e.shiftKey) {
      if (focusData.value.focus.length <= 1) { // 当前只有一个节点被选中时，按住shift键也不会切换focus状态
        block.focus = true;
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        // 清空其它的focus属性
        clearBlockFocus();
        block.focus = true;
      }
      // 当自己已经被选中了，再次被选中时，还是选中状态
    }

    selectIndex.value = index;
    callback(e);
  };

  return {
    focusData,
    lastSelectBlock,
    blockMousedown,
    clearBlockFocus,
    containerMousedown,
  };
}
