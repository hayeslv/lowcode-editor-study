import deepcopy from "deepcopy";
import { onUnmounted } from "vue";
import { GlobalEvent } from "./../config/global";
import { events } from "./../plugins/events";
export function useCommand(data) {
  // 前进后退需要指针
  const state = {
    current: -1, // 前进后退的索引值
    queue: [], // 存放所有的操作命令
    commands: {} as any, // 制作命令和执行功能的一个映射表：undo: () => {}、redo: () => {}
    commandArray: [], // 存放所有的命令
    destoryArray: [], // 销毁列表
  };

  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...args) => { // 命令名称对应执行函数
      const { redo, undo } = command.execute(...args);
      redo(); // 更新数据

      // 当前命令是否需要放入队列中
      if (!command.pushQueue) return;

      // 操作： 1 -> 2 -> 撤回 -> 3，最后的结果应该是 1 -> 3
      // 撤回之后，再放置新元素的话，要把撤回的内容从队列中删掉
      if (state.queue.length > 0) { //! 只有dragend时才会执行 state.commands.drag，能走到这里，说明是不是redo、undo操作
        // 可能在放置的过程中有撤销的操作，所以根据当前最新的 current 值来计算新的队列
        state.queue = state.queue.slice(0, state.current + 1); // 每当有新元素进来时，就把之前撤销的元素全部干掉
      }

      state.queue.push({ redo, undo }); // 存入前进后退方法
      state.current = state.current + 1;
      console.log(state.queue);
    };
  };

  // 注册我们需要的命令
  registry({
    name: "redo",
    keyboard: "ctrl+y",
    execute() {
      return {
        redo() {
          const item = state.queue[state.current + 1]; // 找到当前的下一步，进行还原
          if (item) {
            item.redo && item.redo(); // 使用后一个元素的redo操作：覆盖当前值
            state.current++;
          }
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
          if (state.current === -1) return; // 没有可撤销的了
          const item = state.queue[state.current]; // 找到当前的上一步
          if (item) {
            item.undo && item.undo();
            state.current--;
          }
        },
      };
    },
  });

  registry({ // 如果希望将操作放到队列中，可以增加一个属性进行标识
    name: "drag",
    pushQueue: true, // 是否将此操作放入队列中
    init() { // 初始化指令：默认就会执行
      this.before = null; // 之前的状态

      // 监控拖拽开始事件，保存当前状态
      const start = () => {
        // data.value.blocks 是一个引用类型，当其发生改变后，this.before 也会随之改变
        this.before = deepcopy(data.value.blocks);
      };
      // 拖拽之后需要触发对应的指令
      const end = () => {
        state.commands.drag(); // 拖拽完成后执行的方法（execute）
      };
      events.on(GlobalEvent.Dragstart, start);
      events.on(GlobalEvent.Dragend, end);

      return () => { // 返回一个卸载函数
        events.off(GlobalEvent.Dragstart, start);
        events.off(GlobalEvent.Dragend, end);
      };
    },
    // 调用 execute 时，会默认做一次 redo 操作
    execute() { // state.commands.drag()
      const before = this.before; // 之前的状态
      const after = data.value.blocks; // 现在的状态
      return {
        redo() {
          // 默认一松手，就赋值给它最新的状态
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          // 撤销：还原前一步的状态
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });

  registry({
    name: "updateContainer", // 更新整个容器
    pushQueue: true,
    execute(newValue) {
      const state = {
        before: data.value, // 当前的值
        after: newValue, // 新值
      };
      return {
        redo: () => {
          data.value = state.after;
        },
        undo: () => {
          data.value = state.before;
        },
      };
    },
  });

  const keyboardEvent = (() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const { ctrlKey, key } = e; // 组合是否是 ctrl+z 、 ctrl+y
      const keyString = [];
      if (ctrlKey) keyString.push("ctrl");
      keyString.push(key);
      const str = keyString.join("+");

      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return; // 没有键盘事件
        if (keyboard === str) {
          state.commands[name]();
          e.preventDefault();
        }
      });
    };

    const init = () => {
      window.addEventListener("keydown", onKeyDown);

      return () => { // 返回销毁事件
        window.removeEventListener("keydown", onKeyDown);
      };
    };
    return init;
  })();

  // 执行全部的初始化方法
  (() => {
    // 监听键盘事件
    state.destoryArray.push(keyboardEvent());

    state.commandArray.forEach(command => command.init && state.destoryArray.push(command.init()));
  })();

  // 清理绑定的事件
  onUnmounted(() => {
    state.destoryArray.forEach(fn => fn && fn());
  });

  return state;
}
