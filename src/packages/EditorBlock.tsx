import { computed, defineComponent, inject, onMounted, ref } from "vue";

export default defineComponent({
  props: {
    block: { type: Object, required: true },
  },
  setup(props) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: props.block.zIndex,
    }));

    const config: any = inject("config");

    const blockRef = ref(null);

    onMounted(() => {
      // blockRef.value：可以获取到新增元素的el
      const { offsetWidth, offsetHeight } = blockRef.value;
      if (props.block.alignCenter) { // 说明是拖拽松手的时候才渲染出来的组件，其他默认渲染到页面上的内容不需要居中
        // 不建议直接修改props
        props.block.left = props.block.left - offsetWidth / 2;
        props.block.top = props.block.top - offsetHeight / 2;
        props.block.alignCenter = false;
      }
      props.block.width = offsetWidth;
      props.block.height = offsetHeight;
    });

    return () => {
      // 通过block的key属性，直接获取对应的组件
      const component = config.componentMap[props.block.key];
      // 获取渲染函数
      const RenderComponent = component.render({
        props: props.block.props,
      });
      return <div ref={blockRef} class="editor-block" style={blockStyles.value}>
        {RenderComponent}
      </div>;
    };
  },
});
