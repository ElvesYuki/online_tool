<template>
  <div class="container">
    <Breadcrumb :items="['menu.tool', 'menu.tool.ticketGenerator']" />
    <div class="top-option-btn">
      <a-button type="primary" @click="pageStatus = 1">编辑</a-button>
      <a-button type="primary" @click="previewModal">预览</a-button>
      <a-button type="primary" @click="ticketPrint">打印配置</a-button>
      <a-upload
        action="/"
        :auto-upload="false"
        :file-list="excelFile ? [excelFile] : []"
        :show-file-list="false"
        @change="onExcelChange"
      >
        <template #upload-button>
          <a-button type="primary">上传数据Excel</a-button>
        </template>
      </a-upload>
      <a-upload
        action="/"
        :auto-upload="false"
        :show-file-list="false"
        multiple
        @change="onFaceImgChange"
      >
        <template #upload-button>
          <a-button type="primary">上传人像照片</a-button>
        </template>
      </a-upload>
      <a-button type="primary" @click="ticketPrintPdf">生成PDF</a-button>
    </div>
    <div v-show="pageStatus === 1">
      <RichTextCom ref="richTextCom"></RichTextCom>
    </div>
    <div v-show="pageStatus === 2">
      <div style="margin: 0 0 20px 0">
        <a-button
          v-if="previewModalSize !== ConstA4"
          type="outline"
          @click="previewModalSize = ConstA4"
          >切换A4预览</a-button
        >
        <a-button
          v-if="previewModalSize !== ConstA5"
          type="outline"
          @click="previewModalSize = ConstA5"
          >切换A5预览</a-button
        >
      </div>
      <div :class="previewModalSize == ConstA5 ? 'a5-page' : 'a4-page'">
        <div class="tiptap" v-html="htmlContent"></div>
      </div>
    </div>
    <a-modal v-model:visible="previewModalVisible" width="auto" :footer="false">
      <template #title> 准考证样式预览 </template>
      <div style="margin: 0 0 20px 0">
        <a-button
          v-if="previewModalSize !== ConstA4"
          type="outline"
          @click="previewModalSize = ConstA4"
          >切换A4预览</a-button
        >
        <a-button
          v-if="previewModalSize !== ConstA5"
          type="outline"
          @click="previewModalSize = ConstA5"
          >切换A5预览</a-button
        >
      </div>
      <div :class="previewModalSize == ConstA5 ? 'a5-page' : 'a4-page'">
        <div class="tiptap" v-html="htmlContent"></div>
      </div>
    </a-modal>
    <div class="tiptap" v-html="htmlPrintContent"></div>
    <img :src="htmlPrintContentSrc" alt="" />
  </div>
</template>

<script setup lang="ts">
  import RichTextCom from '@/components/rich-text-com/index.vue';
  import { onMounted, ref } from 'vue';
  import html2canvas from 'html2canvas';
  import { jsPDF as JsPdf } from 'jspdf';
  import { Message } from '@arco-design/web-vue';
  import * as XLSX from 'xlsx';
  import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
  // eslint-disable-next-line import/no-unresolved
  import QRious from 'qrious';

  const ConstA4 = 'A4';
  const ConstA5 = 'A5';

  const richTextCom = ref();
  const htmlContent = ref<string>();
  const htmlPrintContent = ref<string>();
  const htmlPrintContentSrc = ref<string>();

  const pageStatus = ref(1);

  const previewModalVisible = ref(false);
  const previewModalSize = ref('A5');

  const excelFile = ref<File>();
  const excelData = ref<any[][]>();
  const imgFaceData = ref<Map<string, File>>();

  const onExcelChange = (_: any, currentFile: FileItem) => {
    excelFile.value = currentFile.file;
    if (
      excelFile.value?.type !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      Message.error({
        content: '文件类型错误,请上传Excel格式数据文件',
        duration: 5 * 1000,
      });
    }
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 获取工作表中的所有单元格
      const range = XLSX.utils.decode_range(worksheet['!ref'] as string);

      const sheetArray = [];
      // 遍历每一行
      for (let R = range.s.r + 1; R <= range.e.r; R += 1) {
        const row = [];

        // 遍历每一列
        for (let C = range.s.c; C <= range.e.c; C += 1) {
          const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
          if (worksheet[cellRef]) {
            const cell = worksheet[cellRef];
            row[C] = cell.v;
            if (typeof row[C] === 'string') {
              row[C] = row[C].match(/[^(\r|\n)]+/g)?.join('') || '';
            }
          }
        }
        sheetArray[R - 1] = row;
      }
      // 解析 二维 数组
      excelData.value = sheetArray;
    };

    // 读取文件内容作为文本
    reader.readAsArrayBuffer(excelFile.value as Blob);
  };

  const onFaceImgChange = (fileList: FileItem[]) => {
    fileList.forEach((fileItem) => {
      if (fileItem.file !== undefined) {
        const fileName = fileItem.file?.name;
        const keywordsImgFace = `{_I_${fileName?.replace(' ', '')}_}`;
        imgFaceData.value?.set(keywordsImgFace, fileItem?.file);
      }
    });
  };

  const init = () => {
    richTextCom.value.setEditorHtml(htmlContent.value);
    imgFaceData.value = new Map<string, File>();
  };

  const previewModal = () => {
    htmlContent.value = richTextCom.value.getEditorHtml();
    previewModalVisible.value = true;
  };

  const ticketPrint = () => {
    htmlContent.value = richTextCom.value.getEditorHtml();
    pageStatus.value = 2;
  };

  const ticketPrintPdf = () => {
    if (excelData.value === undefined) {
      Message.error({
        content: '请先上传数据',
        duration: 5 * 1000,
      });
      return;
    }
    if (htmlContent.value === undefined) {
      Message.error({
        content: '请先编写模板',
        duration: 5 * 1000,
      });
      return;
    }

    const data: string[][] = excelData.value;
    const template = htmlContent.value;

    const keyIndexMap = new Map<string, number>();
    const keyQRCodeIndexMap = new Map<string, number>();
    // const keyBarcodeIndexMap = new Map<string, number>();
    data[0].forEach((item, index) => {
      const keywords = `{_T_${item.replace(' ', '')}_}`;
      keyIndexMap.set(keywords, index);
      const keywordsQrcode = `{_Q_${item.replace(' ', '')}_}`;
      keyQRCodeIndexMap.set(keywordsQrcode, index);
    });
    const dataPrintList: string[] = [];
    for (let i = 1; i < data.length; i += 1) {
      // 遍历所有数据
      const studentData = data[i];
      let studentTemplate = template;
      keyIndexMap.forEach((value, key) => {
        if (template.includes(key) && value < studentData.length - 1) {
          studentTemplate = studentTemplate.replace(key, studentData[value]);
        }
      });
      keyQRCodeIndexMap.forEach((value, key) => {
        if (template.includes(key) && value < studentData.length - 1) {
          const qr = new QRious({
            value: studentData[value],
          });
          studentTemplate = studentTemplate.replace(
            key,
            `<img src="${qr.toDataURL()}" alt=""/>`
          );
        }
      });
      dataPrintList.push(studentTemplate);
    }

    console.log('keyIndexMap', keyIndexMap);
    console.log('keyQRCodeIndexMap', keyQRCodeIndexMap);
    console.log('dataPrintList', dataPrintList);

    htmlToPdf('测试', dataPrintList, ConstA4);
  };

  const htmlToPdf = (
    title: string,
    contentHtmlList: string[],
    pageSize: string
  ) => {
    const scale = 3;

    const printPageHeight = 841.89;
    const printPageWidth = 595.28;

    const element = document.createElement('div');
    element.style.width = `${printPageWidth}px`;
    element.style.background = '#ffffff';
    contentHtmlList.forEach((item) => {
      const elementChild = document.createElement('div');
      // 添加一个 CSS 类
      elementChild.classList.add('tiptap');
      elementChild.innerHTML = item;
      if (pageSize === ConstA4) {
        // A4纸
        elementChild.style.width = `${printPageWidth}px`;
        elementChild.style.height = `${printPageHeight}px`;
        elementChild.style.padding = `20px`;
      }
      console.log('elementChild', elementChild);
      element.appendChild(elementChild);
    });
    htmlPrintContent.value = element.innerHTML;
    document.body.appendChild(element);
    console.log('element', element);

    // window.pageYOffset = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const w = element.offsetWidth; // 获得该容器的宽
    const h = element.offsetHeight; // 获得该容器的高
    const { offsetTop } = element; // 获得该容器到文档顶部的距离
    const { offsetLeft } = element; // 获得该容器到文档最左的距离
    const canvas = document.createElement('canvas');
    let abs = 0;
    const winI = document.documentElement.clientWidth; // 获得当前可视窗口的宽度（不包含滚动条）
    const winO = window.innerWidth; // 获得当前窗口的宽度（包含滚动条）
    if (winO > winI) {
      abs = (winO - winI) / 2; // 获得滚动条长度的一半
    }
    canvas.width = w * 2; // 将画布宽&&高放大两倍
    canvas.height = h * 2;
    const context = canvas.getContext('2d');
    context?.scale(2, 2);
    context?.translate(-offsetLeft - abs, -offsetTop);

    setTimeout(() => {
      html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        scale: scale as number, // 提升画面质量，但是会增加文件大小
        width: element.scrollWidth, // 需要注意，element的 高度 宽度一定要在这里定义一下，不然会存在只下载了当前你能看到的页面   避雷避雷！！！
        height: element.scrollHeight, // 需要注意，element的 高度 宽度一定要在这里定义一下，不然会存在只下载了当前你能看到的页面   避雷避雷！！！
        windowHeight: element.scrollHeight,
      }).then((canvas) => {
        const contentWidth = canvas.width;
        const contentHeight = canvas.height;
        // 一页pdf显示html页面生成的canvas高度;
        const pageHeight = (contentWidth * printPageHeight) / printPageWidth;
        // 未生成pdf的html页面高度
        let leftHeight = contentHeight;

        // console.log('pageHeight', pageHeight)
        // console.log('leftHeight', leftHeight)
        // 页面偏移
        let position = 0;
        // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高  //40是左右页边距
        const imgWidth = printPageWidth;
        const imgHeight = (printPageWidth / contentWidth) * contentHeight;

        const pageData = canvas.toDataURL('image/jpeg', 1.0);
        htmlPrintContentSrc.value = pageData;

        const pdf = new JsPdf('p', 'pt', 'a4');

        // 有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
        // 当内容未超过pdf一页显示的范围，无需分页
        if (leftHeight < pageHeight) {
          pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } else {
          while (leftHeight > 0) {
            pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
            leftHeight -= pageHeight;
            position -= printPageHeight;
            // 避免添加空白页
            if (leftHeight > 0) {
              pdf.addPage();
            }
          }
        }
        pdf.save(`${title}.pdf`);
      });
    }, 1000);
  };
  onMounted(() => {
    init();
  });
</script>

<script lang="ts">
  export default {
    name: 'TicketGenerator',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
  .top-option-btn {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    background: #ffffff;
    margin: 0 0 20px 0;
    padding: 20px 20px 20px 20px;
    border-radius: 5px;
  }

  .a4-page {
    width: 595.28px;
    height: 841.89px;
    background-color: white;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    padding: 20px;
    overflow: hidden;
  }
  .a5-page {
    width: 595.28px; /* A5 纸张的宽度 */
    height: 419.53px; /* A5 纸张的高度 */
    background-color: white;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    padding: 20px;
    overflow: hidden;
  }
</style>
