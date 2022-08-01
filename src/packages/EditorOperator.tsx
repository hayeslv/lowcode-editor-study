import deepcopy from "deepcopy";
import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus";
import { defineComponent, inject, reactive, watch } from "vue";

export default defineComponent({
  props: {
    block: { type: Object }, // 用户最后选中的元素
    data: { type: Object }, // 当前所有的数据
    updateContainer: { type: Function },
    updateBlock: { type: Function },
  },
  setup(props) {
    const config: any = inject("config"); // 组件的配置信息
    const state = reactive({
      editData: {} as any,
    });

    const reset = () => {
      if (!props.block) { // 说明要绑定的是容器的宽高
        state.editData = deepcopy(props.data.container); // 每次都赋值一个新的对象，确保视图会更新
      } else {
        state.editData = deepcopy(props.block);
      }
    };
    const apply = () => {
      if (!props.block) {
        // 更改组件容器
        props.updateContainer({ ...props.data, container: state.editData });
      } else {
        // 更改组件的配置
        props.updateBlock(state.editData, props.block);
      }
    };

    watch(() => props.block, reset, { immediate: true });

    return () => {
      const content = [];
      if (!props.block) {
        content.push(<>
          <ElFormItem label="容器宽度">
            <ElInputNumber v-model={state.editData.width}></ElInputNumber>
          </ElFormItem>
          <ElFormItem label="容器高度">
            <ElInputNumber v-model={state.editData.height}></ElInputNumber>
          </ElFormItem>
        </>);
      } else {
        const component = config.componentMap[props.block.key];
        if (component && component.props) {
          const formItemList = Object.entries(component.props).map(([propName, propConfig]: [string, any]) => {
            return <ElFormItem label={propConfig.label}>
              {{
                input: () => <ElInput v-model={state.editData.props[propName]}></ElInput>,
                color: () => <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,
                select: () => <ElSelect v-model={state.editData.props[propName]}>
                  {propConfig.options.map(opt => <ElOption label={opt.label} value={opt.value}></ElOption>)}
                </ElSelect>,
              }[propConfig.type]()}
            </ElFormItem>;
          });
          content.push(...formItemList);
        }

        if (component && component.model) {
          //                                                  default   标签名
          content.push(Object.entries(component.model).map(([modelName, label]) => {
            return <ElFormItem label={label as string}>
              {/* model => { default: "username" } */}
              <ElInput v-model={state.editData.model[modelName]}></ElInput>
            </ElFormItem>;
          }));
        }
      }

      return <ElForm labelPosition="top" style="padding: 30px;">
        {content}
        <ElFormItem>
          <ElButton type="primary" onClick={() => apply()}>应用</ElButton>
          <ElButton onClick={reset}>重置</ElButton>
        </ElFormItem>
      </ElForm>;
    };
  },
});
