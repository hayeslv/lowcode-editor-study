import { computed, defineComponent, inject } from "vue";

export default defineComponent({
  props: {
    block: { type: Object, required: true },
  },
  setup(props) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`,
    }));

    const config = inject("config");

    return { config, blockStyles };
  },
  render() {
    // 通过block的key属性，直接获取对应的组件
    const component = this.config.componentMap[this.block.key];
    // 获取渲染函数
    const RenderComponent = component.render();
    return <div class="editor-block" style={this.blockStyles}>
      {RenderComponent}
    </div>;
  },
});
