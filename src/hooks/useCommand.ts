export function useCommand() {
  // 前进后退需要指针
  const state = {
    current: -1, // 前进后退的索引值
    queue: [], // 存放所有的操作命令
    commands: {} as any, // 制作命令和执行功能的一个映射表：undo: () => {}、redo: () => {}
    commandArray: [], // 存放所有的命令
  };

  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = () => { // 命令名称对应执行函数
      const { redo } = command.execute();
      redo();
    };
  };

  // 注册我们需要的命令
  registry({
    name: "redo",
    keyboard: "ctrl+y",
    execute() {
      return {
        redo() {
          console.log("重做");
        },
      };
    },
  });
  registry({
    name: "undo",
    keyboard: "ctrl+z",
    execute() {
      return {
        redo() {
          console.log("撤销");
        },
      };
    },
  });

  return state;
}
