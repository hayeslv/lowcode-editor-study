import { computed, createVNode, defineComponent, inject, onBeforeUnmount, onMounted, provide, reactive, ref, render } from "vue";

export const DropdownItem = defineComponent({
  props: {
    label: String,
    icon: String,
  },
  setup(props) {
    const hide: (e: MouseEvent) => void = inject("hide");

    return () => <div class="dropdown-item" onClick={hide}>
      <i class={props.icon}></i>
      <span>{props.label}</span>
    </div>;
  },
});

const DialogComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      top: 0,
      left: 0,
    });
    ctx.expose({
      showDropDown(option) {
        state.option = option;
        state.isShow = true;
        const { top, left, height } = option.el.getBoundingClientRect();
        state.top = top + height;
        state.left = left;
      },
    });

    provide("hide", () => (state.isShow = false));

    const classes = computed(() => [
      "dropdown",
      {
        "dropdown-isShow": state.isShow,
      },
    ]);
    const styles = computed(() => ({
      top: state.top + "px",
      left: state.left + "px",
    }));

    const el = ref(null);
    const onMousedownDocument = (e: MouseEvent) => {
      if (!el.value.contains(e.target)) { // 如果点击的是dropdown内部，则什么都不做
        state.isShow = false;
      }
    };

    onMounted(() => {
      // 事件的传递行为，是先捕获再冒泡的
      // 之前为了阻止事件传播，我们给block都增加了 stopPropagation
      document.addEventListener("mousedown", onMousedownDocument, true);
    });
    onBeforeUnmount(() => {
      document.removeEventListener("mousedown", onMousedownDocument);
    });
    return () => {
      return <div class={classes.value} style={styles.value} ref={el}>
        {state.option.content()}
      </div>;
    };
  },
});

let vNode;

export function $dropdown(option) {
  // element-plus中有el-dialog组件
  // 手动挂载组件

  if (!vNode) {
    const el = document.createElement("div");
    // 将组件渲染成虚拟节点
    vNode = createVNode(DialogComponent, { option });

    // render：把虚拟节点变成真实节点
    // 将组件渲染到这个el元素上
    render(vNode, el);
    document.body.appendChild(el);
  }
  const { showDropDown } = vNode.component.exposed;
  showDropDown(option);
}
