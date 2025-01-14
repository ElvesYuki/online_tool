<template>
  <div>富文本</div>
  <div class="editorBox">
    <div v-if="editor">
      <div v-if="editable" class="editorTop">
        <div
          class="iconBtn"
          :class="{ 'is-active': editor.isActive('bold') }"
          @click="toggleBold"
        >
          <icon-bold />
        </div>
        <div
          class="iconBtn"
          :class="{ 'is-active': editor.isActive('italic') }"
          @click="toggleItalic"
        >
          <icon-oblique-line />
        </div>
        <div
          class="iconBtn"
          :class="{ 'is-active': editor.isActive('underline') }"
          @click="toggleUnderline"
        >
          <icon-underline />
        </div>
        <div
          class="iconBtn"
          :class="{ 'is-active': editor.isActive('strike') }"
          @click="toggleStrike"
        >
          <icon-strikethrough />
        </div>
        <div
          class="iconBtn"
          :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
          @click="toggleAlignLeft"
        >
          <icon-align-left />
        </div>
        <bubble-menu
          class="bubble-menu"
          :tippy-options="{ duration: 100 }"
          :editor="editor"
        >
          <div
            class="iconBtn"
            :class="{ 'is-active': editor.isActive('bold') }"
            @click="toggleBold"
          >
            <icon-bold />
          </div>
          <div
            class="iconBtn"
            :class="{ 'is-active': editor.isActive('italic') }"
            @click="toggleItalic"
          >
            <icon-oblique-line />
          </div>
          <div
            class="iconBtn"
            :class="{ 'is-active': editor.isActive('underline') }"
            @click="toggleUnderline"
          >
            <icon-underline />
          </div>
          <div
            class="iconBtn"
            :class="{ 'is-active': editor.isActive('strike') }"
            @click="toggleStrike"
          >
            <icon-strikethrough />
          </div>
          <div
            class="iconBtn"
            :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
            @click="toggleAlignLeft"
          >
            <icon-align-left />
          </div>
        </bubble-menu>
      </div>
    </div>
    <editor-content
      :editor="editor"
      style="min-height: 200px"
      @click="editor.chain().focus()"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onUnmounted, computed } from 'vue';
  import { EditorContent, BubbleMenu, useEditor } from '@tiptap/vue-3';
  import StarterKit from '@tiptap/starter-kit';
  // import { Placeholder } from '@tiptap/extension-placeholder';
  import Underline from '@tiptap/extension-underline';
  import { Image } from '@tiptap/extension-image';
  import { Color } from '@tiptap/extension-color';
  import TextAlign from '@tiptap/extension-text-align';
  import TextStyle from '@tiptap/extension-text-style';
  import CharacterCount from '@tiptap/extension-character-count';
  // import ListItem from '@tiptap/extension-list-item';

  // 创建编辑器实例
  const editor = useEditor({
    extensions: [
      StarterKit,
      Color,
      TextStyle,
      Image.configure({
        allowBase64: true, // 启用 Base64 图片
        HTMLAttributes: {
          style: 'display: block; margin: 0 auto;', // 设置图片样式
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CharacterCount.configure({}),
    ],
    content: {
      type: 'doc',
    },
    editable: true,
    // 配置粘贴事件处理
    onPaste(event) {
      const items = event.clipboardData?.items;
      if (items) {
        // 如果剪贴板中的内容是图片
        for (let i = 0; i < items.length; i += 1) {
          const item = items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              // 将图片转换为 Base64 格式
              convertToBase64(file).then((base64) => {
                // 插入 Base64 图片
                editor.value?.chain().focus().setImage({ src: base64 }).run();
                const pos =
                  (editor.value?.state.selection.$anchor.pos ?? 0) + 1;
                editor.value?.commands.setTextSelection(pos); // 将光标定位到图片后
              });
              event.preventDefault(); // 阻止默认的粘贴行为
              return;
            }
          }
        }
      }
    },
  });

  // 点击加粗
  const toggleBold = (event: MouseEvent) => {
    event.preventDefault(); // 防止按钮默认行为
    editor.value?.chain().focus().toggleBold().run();
  };

  // 点击斜体
  const toggleItalic = (event: MouseEvent) => {
    event.preventDefault(); // 防止按钮默认行为
    editor.value?.chain().focus().toggleItalic().run();
  };

  // 点击横线
  const toggleStrike = (event: MouseEvent) => {
    event.preventDefault(); // 防止按钮默认行为
    editor.value?.chain().focus().toggleStrike().run();
  };

  // 点击下划线
  const toggleUnderline = (event: MouseEvent) => {
    event.preventDefault(); // 防止按钮默认行为
    editor.value?.chain().focus().toggleUnderline().run();
  };

  // 文本居中
  const toggleAlignCenter = (event: MouseEvent) => {
    event.preventDefault(); // 防止按钮默认行为
    editor.value?.chain().focus().setTextAlign('center').run();
  };
  // 文本左
  const toggleAlignLeft = (event: MouseEvent) => {
    event.preventDefault(); // 防止按钮默认行为
    editor.value?.chain().focus().setTextAlign('left').run();
  };
  // 文本右
  const toggleAlignRight = (event: MouseEvent) => {
    event.preventDefault(); // 防止按钮默认行为
    editor.value?.chain().focus().setTextAlign('right').run();
  };
  // list
  const toggleOrderedList = (event: MouseEvent) => {
    event.preventDefault(); // 防止按钮默认行为
    editor.value?.chain().focus().toggleOrderedList().run();
  };
  // list
  const toggleBulletList = (event: MouseEvent) => {
    event.preventDefault(); // 防止按钮默认行为
    editor.value?.chain().focus().toggleBulletList().run();
  };

  // 增加缩进
  const increaseIndent = () => {
    editor.value?.commands.setNode('paragraph', { style: 'margin-left: 20px' });
  };

  // 减少缩进
  const decreaseIndent = () => {
    editor.value?.commands.setNode('paragraph', { style: 'margin-left: 0px' });
  };

  // 将图片文件转换为 Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string); // 返回 Base64 字符串
      };
      reader.onerror = reject;
      reader.readAsDataURL(file); // 将文件读为 Base64
    });
  };

  // 获取文本框内容
  const getEditorHtml = () => {
    let html = editor.value?.getHTML() || '';

    // 使用正则表达式，仅替换纯文本中的空格为 &nbsp;
    // 排除 <img> 标签中的 src 属性，防止破坏 Base64 图片内容
    html = html.replace(/(>)([^<]*)(<)/g, (match, before, text, after) => {
      // 只替换纯文本中的空格为 &nbsp;
      const updatedText = text.replace(/ /g, '&nbsp;');
      return before + updatedText + after;
    });

    return html;
  };
  // 设置文本框内容
  const setEditorHtml = (content: string) => {
    editor.value?.commands.setContent(content);
  };
  const editable = ref(true);
  // 是否禁用编辑
  const editForbid = () => {
    editable.value = false;
    editor.value?.setOptions({ editable: editable.value });
  };

  const characterCount = computed(() => {
    return editor.value?.storage.characterCount.characters();
  });

  // 对外暴露字段，方法
  defineExpose({
    getEditorHtml,
    setEditorHtml,
    editForbid,
  });
  // 在组件销毁时清理编辑器
  onUnmounted(() => {
    editor.value?.destroy();
  });
</script>

<script lang="ts">
  export default {
    name: 'RichTextCom',
  };
</script>

<style scoped lang="less">
  .editorBox {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
  }
  .editorTop {
    box-sizing: border-box;
    padding: 0 20px;
    width: 100%;
    height: 40px;
    top: 0;
    left: 0;
    border-bottom: 1px solid #ccc;
    background: #fff;
    display: flex;
    align-items: center;
    .inputColor {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    .iconBtn {
      width: 22px;
      height: 22px;
      box-sizing: content-box;
      padding: 1px;
      cursor: pointer;
      margin-left: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        max-width: 100%;
        max-height: 100%;
      }
      &:hover {
        background: #ebebeb;
        border-radius: 6px;
      }
    }
    .is-active {
      background: #ebebeb;
      border-radius: 6px;
    }
  }
  .editorBottom {
    position: absolute;
    box-sizing: border-box;
    padding: 0 20px;
    height: 40px;
    width: 100%;
    bottom: 0;
    left: 0;
    border-top: 1px solid #ccc;
    background: #fff;
    display: flex;
    justify-content: end;
    align-items: center;
  }

  .bubble-menu {
    background-color: #fff;
    border: 1px solid #fff;
    border-radius: 20px;
    box-shadow: 1px 1px 10px 0px #ccc;
    display: flex;
    padding: 4px;
    button {
      background-color: unset;
      padding: 6px 10px;
      border-radius: 20px;
      margin: 0 2px;
      &:hover {
        background-color: #ccc;
      }
      &.is-active {
        background-color: #ccc;
        &:hover {
          background-color: #ccc;
        }
      }
    }
  }
</style>
