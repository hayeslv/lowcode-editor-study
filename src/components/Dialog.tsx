import { ElDialog } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const DialogComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    return () => {
      return <ElDialog></ElDialog>;
    };
  },
});

let vNode;

export function $dialog(option) {
  // element-plus中有el-dialog组件
  // 手动挂载组件

  const el = document.createElement("div");
  // 将组件渲染成虚拟节点
  vNode = createVNode(DialogComponent, { option });

  // render：把虚拟节点变成真实节点
  // 将组件渲染到这个el元素上
  render(vNode, el);
  document.body.appendChild(el);
}
