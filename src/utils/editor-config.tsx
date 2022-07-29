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

const createInputProp = (label: string) => ({ type: "input", label });
const createColorProp = (label: string) => ({ type: "color", label });
const createSelectProp = (label: string, options: { label: string; value: string }[]) => ({ type: "select", label, options });

registorConfig.registor({
  key: "text",
  label: "文本",
  props: {
    text: createInputProp("文本内容"),
    color: createColorProp("字体颜色"),
    size: createSelectProp("字体大小", [
      { label: "14px", value: "14px" },
      { label: "20px", value: "20px" },
      { label: "24px", value: "24px" },
    ]),
  },
  preview: () => "预览文本",
  render: () => "渲染文本",
});

registorConfig.registor({
  key: "button",
  label: "按钮",
  props: {
    text: createInputProp("按钮内容"),
    type: createSelectProp("按钮类型", [
      { label: "基础", value: "primary" },
      { label: "成功", value: "success" },
      { label: "警告", value: "warning" },
      { label: "危险", value: "danger" },
      { label: "文本", value: "text" },
    ]),
    size: createSelectProp("按钮尺寸", [
      { label: "默认", value: "" },
      { label: "中等", value: "medium" },
      { label: "小", value: "small" },
      { label: "极小", value: "mini" },
    ]),
  },
  preview: () => <ElButton>预览按钮</ElButton>,
  render: () => <ElButton>渲染按钮</ElButton>,
});

registorConfig.registor({
  key: "input",
  label: "输入框",
  preview: () => <ElInput placeholder="预览输入框" />,
  render: () => <ElInput placeholder="渲染输入框" />,
});
