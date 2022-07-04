// 列表区可以显示所有的物料
// key对应的组件映射关系

import { ElButton, ElInput } from "element-plus";

function createEditorConfig() {
  const componentList = [];
  const componentMap = {};

  return {
    componentList,
    componentMap,
    registor: (component) => {
      componentList.push(component);
      componentMap[component.key] = component;
    },
  };
}

export const registorConfig = createEditorConfig();

registorConfig.registor({
  key: "text",
  label: "文本",
  preview: () => "预览文本",
  render: () => "渲染文本",
});

registorConfig.registor({
  key: "button",
  label: "按钮",
  preview: () => <ElButton>预览按钮</ElButton>,
  render: () => <ElButton>渲染按钮</ElButton>,
});

registorConfig.registor({
  key: "input",
  label: "输入框",
  preview: () => <ElInput placeholder="预览输入框" />,
  render: () => <ElInput placeholder="渲染输入框" />,
});
