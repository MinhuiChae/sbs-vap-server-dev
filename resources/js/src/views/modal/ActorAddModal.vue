<template>
  <div class = 'confirm-wrapper' ref = 'el'>
    <ModalUi
      ref = "modalComp"
      @closeAction="onCloseAction"
      class = "actor-add-modal-wrapper"

      >
      <template #header-slot>
        &nbsp; &nbsp; 신규 인물 등록
      </template>
      <template #body-slot>
        <div class ='actor-file-wrapper'>
          <GridPanel
          ref = "gridComp"
          :columns="state.fileColumns"
          :datas="state.files"
          :useBuildGridData = "true"
          >
          <template #header-slot>
            <div class = 'header-tool-wrapper'>
              <div class = 'tools-info'>
                <div>
                    <label for ="input-file" class = 'file-label'> 파일 선택 </label>
                    <input type = 'file'
                        id = "input-file"
                        multiple = "multiple"
                        @change="onChangeFile"
                        style = "display:none"
                        accept = ".jpeg, .jpg, .png" readonly="readonly"
                    >
                </div>
                <div>
                Total : {{ state.files.length }} / 용량초과: {{ getFileSizeOverCount }}
                </div>

              </div>
              <div class = 'tools-btns'>
                <span style='font-size:0.8rem;padding-right:10px'> 사진 용량은 500KB 미만 </span>
                <button class ='btn-normal' @click.stop.prevent="onDeleteActors"> 삭제 </button>
                <button class ='btn-normal' :disabled ="state.isClickedSaveBtn" @click.stop.prevent="onSave" :class = "{isActive: state.isClickedSaveBtn }"> 등록 </button>
              </div>
            </div>
          </template>
          <template #thumb_cell-slot="datas">
            <img :src = "getImageSrc(datas)" class ='image-thumb'/>
          </template>

          <template #face_nm_cell-slot="datas">
            <div class = 'face-cell-slot-wrapper' @click.stop.prevent="onCellClick($event, datas)">{{ datas.face_nm }}</div>
          </template>

           <template #size_cell-slot="datas">
            {{ getByteSize(datas.size) }}
          </template>

          </GridPanel>
        </div>
      </template>
      <template #footer-slot>
        <div class ='footer-btns-wrapper'>
          <!-- <div class ='button' @click.stop.prevent = "onAcceptBtnClick"> 적용 </div> -->
          <div class ='button' @click.stop.prevent = "onCloseBtnClick"> 닫기 </div>
        </div>
     </template>
    </ModalUi>
  </div>
  <div class = 'editor-cell-wrapper' v-if = "state.isCellEdit" @click.stop="onCellEditorOuterClick">
    <div class = 'editor-cell-inner-wrapper' ref = "editorCellEl">
      <input type ='text' ref= 'editorInputEl' @click.stop.prevent @keyup.enter="onChangeName"/>
    </div>
  </div>
  <teleport to="body">
    <div v-if = "state.dropActive" class="drop-active" rel = "dropActiveEl">
      <h1>Drop files to upload</h1>
    </div>
  </teleport>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, onUnmounted, reactive, ref, SetupContext } from 'vue'
import ModalUi from '@/components/ui/modal/Modal.vue';

import GridPanel from '@/components/ui/grid/GridPanel.vue';
import { EColumnType, IColumn } from '@/interfaces/ui';
import useFileSize from '@/composition/useFileSize';
import axios from 'axios';
import useFecth from '@/composition/useFetch';
import useCustomEvent from '@/composition/useCustomEvent';
import useCommon from '@/composition/useCommon';

interface IFileInfo {
  id: number,
  face_nm: string,
  file: File,
  size: number,
  status: string,
  rowCls: string,
}

export default defineComponent({
  name:'ActorAddModal',
  emits: ['closeAction', 'acceptAction', 'reloadAction'],
  components: {
    ModalUi,
    GridPanel,
  },
  props: {
    closed: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: Number,
      require: true,
    },
    useSelfEvent : {
      type: Boolean,
      default: true,
    }
  },
  setup(props, context: SetupContext) {
    const el = ref();
    const dropActiveEl = ref();
    const editorCellEl = ref();
    const editorInputEl = ref();
    const modalComp = ref<InstanceType<typeof ModalUi>>();
    const gridComp = ref<InstanceType<typeof GridPanel>>();
    const { getByteSize, inValidateSize } = useFileSize();
    const { disPacthEvent } = useCustomEvent();
    const state = reactive({
      total: 0,
      fileStartNum : 1,
      groupName: '',
      invalidMsg: '',
      dropActive: false,
      isCellEdit: false,
      isShowCellEdit: false,
      editFileinfo: null,
      limitFileSize: 1024 * 500,
      isClickedSaveBtn: false,
      fileColumns: [{
        name: '',
        type: EColumnType.Checkbox,
        title:'',
        width: '50px',
      },{
        name: '',
        type: EColumnType.Number,
        title: 'No',
        width: '75px',
      },{
        name: 'thumb',
        type: EColumnType.String,
        title: '인물',
        width: '100px',
        dataIndex: 'thumb',
      },{
        name: 'face_nm',
        type: EColumnType.String,
        title: '이름',
        width: '',
        dataIndex: 'face_nm',
      },{
        name: 'size',
        type: EColumnType.String,
        title: '크기',
        width: '100px',
        dataIndex: 'size',
      },{
        name: 'status',
        type: EColumnType.String,
        title: '상태',
        width: '100px',
        dataIndex: 'status',
      }] as IColumn[],
      files: [] as IFileInfo[],
    })

    const onCloseAction = () => context.emit('closeAction');

    const getFileSizeOverCount = computed(() => {
      return state.files.filter((file)=> inValidateSize(file.size, state.limitFileSize) === true).length;
    })

    const onChangeFile = async (e: Event) => {
      if (!(e.target instanceof HTMLInputElement)) {
        return Promise.reject(new Error("not HTMLInputElement"))
      }

      const targetEl: HTMLInputElement = e.target;
      if (targetEl && targetEl.files && targetEl.files.length > 0) {
        const elfiles = targetEl.files;
        Array.from(elfiles).forEach((elfile, i) => {
          let file = elfile;
          if (file.type.indexOf('image') > -1){
            addFileItem( i.toString(), file);
          }
        })
      }
    }

    const getOnlyFilename = (fileName: string): string => {
      const lastDot = fileName.lastIndexOf('.');
      return fileName.substring(0, lastDot);
    }

    const addFileItem = (name: string = '', file: File ) => {
      let status = '대기';
      if (file === null) return;
      if (file.type.indexOf('image') === -1){
        return ;
      }
      if (inValidateSize(file.size, state.limitFileSize)) {
        status = '용량초과'
      }

      state.files.push({
        id: state.fileStartNum++,
        face_nm: getOnlyFilename(file.name),
        file,
        size: file.size,
        status,
        rowCls: status !== '대기' ? 'invalidRow' : '',
      });
    }

    const onCloseBtnClick = () => {
      modalComp.value.onCloseAction();
    }

    const onInputFocus = () => {}

    const onDragenter = (e: DragEvent) => {
      e.preventDefault();
      el.value.style.opacity = '0.5';
      const dt = e.dataTransfer;
      if (state.dropActive) {
        return;
      }

      state.dropActive = true;
    }

    const onDragleave = (e: DragEvent) => {
      e.preventDefault();
      if ((e.target as HTMLElement).classList.contains('drop-active')) {
        doDragleave();
      }
    }

    const doDragleave = () => {
      if (el.value) {
        el.value.style.opacity = '1';
      }
      state.dropActive = false;
    }

    const onDragover = (e:DragEvent) => {
      e.preventDefault();
    }

    const onDragDrop = (e:DragEvent) => {
      e.preventDefault();
      addDataTransfer(e.dataTransfer);
      doDragleave();
    }

    const addDataTransfer = (dataTransfer: DataTransfer) => {
      if (dataTransfer?.items?.length) {
        Array.from(dataTransfer?.items).forEach((item) => {
          addFileItem('', item.getAsFile());
        });
      }
    }

    const getImageSrc = (data: any) => {
      const file = data.file as File;
      if (file.type.indexOf('image') >-1) {
        return URL.createObjectURL(file);
      }
      return '';
    }

    const doFileUpload = (file: IFileInfo): Promise<any> => {
      const url = `${useCommon.getApiUrl()}/actor/group/${props.groupId}/actors`; //http://10.10.210.232/api/actor/group/2/actors';

      const formData = new FormData();
      formData.append('face_nm', file.face_nm);
      formData.append('image', file.file);

      return useFecth(url,{
        headers: {},
        method: 'post',
        body: formData
      });
    }


    const onSave = async () => {
      const vaildFileList = state.files.filter((file) => file.status !=='등록완료');
      state.isClickedSaveBtn = true;
      if (vaildFileList.length > 0) {
        let sucessCnt = 0;
        let failCnt = 0;
        for (const list of vaildFileList) {
          list.status = '등록중';
          const res = await doFileUpload(list);
          if (res.success) {
            sucessCnt++;
            list.status = '등록완료';
          } else {
            failCnt++;
            list.status = '등록실패';
          }

          if (sucessCnt + failCnt === vaildFileList.length) {
            context.emit('reloadAction');
            state.isClickedSaveBtn = false;
          }
        }
      } else {
        state.isClickedSaveBtn = false;
        disPacthEvent('popUpMessage', {msg: '파일이 없습니다.'});
      }
    }

    const onCellEditorOuterClick = () => {
      if(state.isCellEdit === true) {
        state.isCellEdit = false;
        state.isShowCellEdit = false;
      }
    }

    const onDeleteActors = () => {
      const selectedItems = gridComp.value.getSelectedItems();
      const selectedItemsIds = selectedItems.filter((item) => item.id);
      if (selectedItemsIds.length > 0) {
        selectedItemsIds.forEach((seledtedItem)=> {
          const findIndex = state.files.findIndex((file) => file.id === seledtedItem.id);
          if (findIndex > -1) {
            state.files.splice(findIndex, 1);
          }
        });
        gridComp.value.buildGridRowData();
      } else {
        disPacthEvent('popUpMessage', {msg: '파일이 없습니다.'});
      }
    }

    onUnmounted(() => {
      if (props.useSelfEvent === true) {
        document.body.removeEventListener('dragenter', onDragenter, false);
        document.body.removeEventListener('dragleave', onDragleave, false)
        document.body.removeEventListener('dragover', onDragover, false)
        document.body.removeEventListener('drop', onDragDrop, false);
      }
    })

    onMounted(() => {
      if (props.useSelfEvent === true) {
        document.body.addEventListener('dragenter', onDragenter, false);
        document.body.addEventListener('dragleave', onDragleave, false);
        document.body.addEventListener('dragover', onDragover, false)
        document.body.addEventListener('drop', onDragDrop, false);
      }
    });

    const onCellClick = (e: MouseEvent, editFileinfo: any) => {
      const target = e.target;
      const targetRect = (target as HTMLElement).getBoundingClientRect();
      state.isCellEdit = true;
      state.editFileinfo = editFileinfo
      nextTick(() => {
        if (state.isShowCellEdit === false) {
          editorCellEl.value.style.opacity = 1;
          editorCellEl.value.style.left = `${targetRect.left-5}px`;
          editorCellEl.value.style.top = `${targetRect.top-13}px`;
          editorInputEl.value.value = editFileinfo.face_nm;
          editorInputEl.value.style.width = `${targetRect.width-5}px`;
          editorInputEl.value.focus();
          state.isShowCellEdit = true;
        }
      });
    }


    const onChangeName = () => {
      const value = editorInputEl.value.value;
      if (value.trim() === '') {
        editorCellEl.value.value = state.editFileinfo.face_nm;
      } else {
        // state.editFileinfo.face_nm = value;
        const changeFile = state.files.find((file) => file.id === state.editFileinfo.id)
        changeFile.face_nm = value;
      }
      nextTick(() => {
        state.isCellEdit = false;
        state.isShowCellEdit = false;
      });
    }

    return {
      el,
      onCloseAction,
      onInputFocus,
      onCloseBtnClick,
      onChangeFile,
      dropActiveEl,
      state,
      modalComp,
      getImageSrc,
      onSave,
      onCellClick,
      editorCellEl,
      editorInputEl,
      onChangeName,
      getByteSize,
      getFileSizeOverCount,
      onDeleteActors,
      gridComp,
      addDataTransfer,
      onCellEditorOuterClick,
    }
  },
})
</script>
<style lang="scss" >
  @import '@/scss/variables.scss';
  .invalidRow {
    background-color: rgba(255, 53, 53, 0.7);
  }

  .editor-cell-wrapper {
    position: absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    z-index: 100000;
    .editor-cell-inner-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 100000;
      opacity: 0;
    }
    input {
      height: 38px;
      font-size: 16px;
      text-indent: 5px;
      min-width: 120px;
    }
  }

  .face-cell-slot-wrapper {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    display: block;
    width: 100%;
  }
  .actor-add-modal-wrapper {

    .modal-ui-content-panel  {
      width: 90%;
      // background-color: #222 !important;
    }

    .footer-btns-wrapper {
      height:55px;
      display: flex;
      width:100%;
      .button {
        flex:1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: 0.2s;
        &:hover {
          background-color: $base-dark-color;
        }
      }
    }
  }

  .image-thumb {
    max-width: 4em;
    max-height: 4em;
  }

  .file-label {
    padding: 8px 20px;
    border: 0px;
    border-radius: 2px;
    background: #444;
    color: #eee;
    outline: none;
    margin-right: 10px;
    cursor: pointer;
    transition: 0.2s;
    &:hover {
      background: #555;
    }
  }

  .drop-active {
    // pointer-events: none;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    position: fixed;
    z-index: 100001;
    opacity: .7;
    text-align: center;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    h1 {
      pointer-events: none;
    }
  }

  .header-tool-wrapper {
    display: flex;
    min-height:  45px;
    align-items: center;
    .tools-info {
      display: flex;
      align-items: center;
    }
    .tools-btns {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 1;
    }
  }

  .actor-file-wrapper {
    width:100%;
    padding:10px;
    border-radius: 10px;
    height: 300px;
    background-color: #2e2e2e;
  }


</style>
