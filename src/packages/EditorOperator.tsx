import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus";
import { defineComponent, inject } from "vue";

export default defineComponent({
  props: {
    block: { type: Object }, // 用户最后选中的元素
    data: { type: Object }, // 当前所有的数据
  },
  setup(props) {
    const config: any = inject("config"); // 组件的配置信息

    return () => {
      const content = [];
      if (!props.block) {
        content.push(<>
          <ElFormItem label="容器宽度">
            <ElInputNumber></ElInputNumber>
          </ElFormItem>
          <ElFormItem label="容器高度">
            <ElInputNumber></ElInputNumber>
          </ElFormItem>
        </>);
      } else {
        const component = config.componentMap[props.block.key];
        if (component && component.props) {
          const formItemList = Object.entries(component.props).map(([propName, propConfig]: [string, any]) => {
            return <ElFormItem label={propConfig.label}>
              {{
                input: () => <ElInput></ElInput>,
                color: () => <ElColorPicker></ElColorPicker>,
                select: () => <ElSelect>
                  {propConfig.options.map(opt => <ElOption label={opt.label} value={opt.value}></ElOption>)}
                </ElSelect>,
              }[propConfig.type]()}
            </ElFormItem>;
          });
          content.push(...formItemList);
        }
      }

      return <ElForm labelPosition="top" style="padding: 30px;">
        {content}
        <ElFormItem>
          <ElButton type="primary">应用</ElButton>
          <ElButton>重置</ElButton>
        </ElFormItem>
      </ElForm>;
    };
  },
});
