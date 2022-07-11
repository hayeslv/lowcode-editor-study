import { ElButton, ElDialog, ElInput } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const DialogComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option, // 用户给组件的属性
      isShow: false,
    });
    // 组件要暴露的方法（让外界可以调用组件的方法）
    ctx.expose({
      showDialog(option) {
        // 每次调用showDialog的时候，把属性更新一下；这样就能保证每次拿到的都是最新的了
        state.option = option;
        console.log(state.option);
        state.isShow = true;
      },
    });

    const cancel = () => {
      state.isShow = false;
    };
    const confirm = () => {
      state.isShow = false;
      state.option.onConfirm && state.option.onConfirm(state.option.content);
    };

    return () => {
      // return <ElDialog v-model={state.isShow}></ElDialog>;
      return <ElDialog
        modelValue={state.isShow}
        title={state.option.title}
        {...{ "onUpdate:modelValue": (flag) => (state.isShow = flag) }}
      >
        {{
          default: () => <ElInput type="textarea" v-model={state.option.content} {...{ rows: 10 }} />,
          footer: () => state.option.footer && <div>
            <ElButton onClick={cancel}>取消</ElButton>
            <ElButton type="primary" onClick={confirm}>确定</ElButton>
          </div>,
        }}
      </ElDialog>;
    };
  },
});

let vNode;

export function $dialog(option) {
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
  const { showDialog } = vNode.component.exposed;
  showDialog(option);
}
