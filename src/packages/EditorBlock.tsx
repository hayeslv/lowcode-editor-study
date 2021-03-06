import { computed, defineComponent, inject, onMounted, ref } from "vue";
import BlockResize from "./BlockResize";

export default defineComponent({
  props: {
    block: { type: Object, required: true },
    formData: { type: Object },
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
        size: props.block.hasResize ? { width: props.block.width, height: props.block.height } : {},
        props: props.block.props,
        // model: props.block.model
        model: Object.keys(component.model || {}).reduce((prev, modelName) => {
          const propName = props.block.model[modelName]; // username
          prev[modelName] = {
            modelValue: props.formData[propName], // 这里绑定username
            "onUpdate:modelValue": value => (props.formData[propName] = value),
          };
          return prev;
        }, {} as any),
      });

      const { width, height } = component.resize || {};
      return <div ref={blockRef} class="editor-block" style={blockStyles.value}>
        {RenderComponent}
        {/* 传递block的目的，是为了修改当前block的宽高。component中存放了是修改宽度还是高度 */}
        {props.block.focus && (width || height) && <BlockResize block={props.block} component={component}></BlockResize>}
      </div>;
    };
  },
});
