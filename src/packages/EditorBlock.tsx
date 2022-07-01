import { computed, defineComponent } from "vue";

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

    return { blockStyles };
  },
  render() {
    return <div class="editor-block" style={this.blockStyles}>test</div>;
  },
});
