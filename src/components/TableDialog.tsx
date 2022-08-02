import deepcopy from "deepcopy";
import { ElButton, ElDialog, ElInput, ElTable, ElTableColumn } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const TableComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      editData: [], // 编辑的数据
    });

    const methods = {
      show(option) {
        state.option = option; // 把用户的配置缓存起来
        state.isShow = true; // 更改显示状态
        state.editData = deepcopy(option.data); // 通过渲染的数据，默认展现
      },
    };

    const add = () => {
      state.editData.push({});
    };
    const onCancel = () => {
      state.isShow = false;
    };
    const onConfirm = () => {
      state.option.onConfirm(state.editData);
      onCancel();
    };

    ctx.expose(methods);

    return () => {
      return <ElDialog
        title={state.option.config.label}
        modelValue={state.isShow}
        {...{ "onUpdate:modelValue": (flag) => (state.isShow = flag) }}>
        {{
          default: () => (
            <div>
              <div>
                <ElButton onClick={add}>添加</ElButton>
                <ElButton>重置</ElButton>
              </div>
              <ElTable data={state.editData}>
                <ElTableColumn type="index" />
                {
                  state.option.config.table.options.map((item, index) => {
                    return <ElTableColumn key={index} label={item.label}>
                      {{
                        default: ({ row }) => <ElInput v-model={row[item.field]} />,
                      }}
                    </ElTableColumn>;
                  })
                }
                <ElTableColumn label="操作">
                  <ElButton type="danger">删除</ElButton>
                </ElTableColumn>
              </ElTable>
            </div>
          ),
          footer: () => <>
            <ElButton onClick={onCancel}>取消</ElButton>
            <ElButton onClick={onConfirm}>确定</ElButton>
          </>,
        }}
      </ElDialog>;
    };
  },
});

let vm;
export const $tableDialog = (option) => {
  if (!vm) {
    const el = document.createElement("div");
    vm = createVNode(TableComponent, { option });

    const r = render(vm, el);
    document.body.appendChild(el);
  }

  const { show } = vm.component.exposed;
  show(option);
};
