// 列表区可以显示所有的物料
// key对应的组件映射关系

import { ElButton, ElInput, ElSelect } from "element-plus";
import Range from "~/components/Range";

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
const createTableProp = (label: string, table: any) => ({ type: "table", label, table });

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
  render: ({ props }) => <span style={{ color: props.color, fontSize: props.size }}>{props.text || "渲染文本"}</span>,
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
      { label: "大", value: "large" },
      { label: "小", value: "small" },
    ]),
  },
  preview: () => <ElButton>预览按钮</ElButton>,
  render: ({ props }) => <ElButton type={props.type} size={props.size}>{props.text || "渲染按钮"}</ElButton>,
});

registorConfig.registor({
  key: "input",
  label: "输入框",
  model: {
    default: "绑定字段",
  },
  preview: () => <ElInput placeholder="预览输入框" />,
  render: ({ model }) => <ElInput placeholder="渲染输入框" {...model.default} />,
});

registorConfig.registor({
  key: "select",
  label: "下拉框",
  props: { // [{label: "", value: ""}]
    options: createTableProp("下拉选项", {
      key: "label", // 显示给用户的是label值
      options: [
        { label: "显示值", filed: "label" },
        { label: "绑定值", filed: "value" },
      ],
    }),
  },
  preview: () => <ElSelect modelValue=""></ElSelect>,
  render: ({ props }) => <ElSelect modelValue=""></ElSelect>,
});

// 注册远程物料
registorConfig.registor({
  key: "range",
  label: "范围选择器",
  model: {
    start: "开始范围字段",
    end: "结束范围字段",
  },
  preview: () => <Range></Range>,
  render: ({ model }) => {
    return <Range {...{
      start: model.start.modelValue,
      "onUpdate:start": model.start["onUpdate:modelValue"],
      end: model.end.modelValue,
      "onUpdate:end": model.end["onUpdate:modelValue"],
    }}></Range>;
  },
});
