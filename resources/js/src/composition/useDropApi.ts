

/**
 * drop 관련
 *
 */

 const useDropApi = () => {

  const state = {
    isInitDragEl: false,
    initEl: null,
    el: null,
    defaultId: 'dragTargetShadowEl',
    dragEnterCallback: null,
    beforeDragEnterCallback: null,
    beforeDragLeaveCallback: null,
    beforeDropCallback: null,
    dropCallback: null,
    dragLeaveCallback: null,
  }

  const init = (el: HTMLElement, opts: any) => {
    state.el = el;

    if (opts.dragEnterCallback && opts.dragEnterCallback instanceof Function) {
      state.dragEnterCallback = opts.dragEnterCallback;
    }

    if (opts.beforeDragEnterCallback && opts.beforeDragEnterCallback instanceof Function) {
      state.beforeDragEnterCallback = opts.beforeDragEnterCallback;
    }

    if (opts.beforeDragLeaveCallback && opts.beforeDragLeaveCallback instanceof Function) {
      state.beforeDragLeaveCallback = opts.beforeDragLeaveCallback;
    }

    if (opts.beforeDropCallback && opts.beforeDropCallback instanceof Function) {
      state.beforeDropCallback = opts.beforeDropCallback;
    }

    if (opts.dropCallback && opts.dropCallback instanceof Function) {
      state.dropCallback = opts.dropCallback;
    }

    if (opts.dragLeaveCallback && opts.dragLeaveCallback instanceof Function) {
      state.dragLeaveCallback = opts.dragLeaveCallback;
    }

    addEvt();
  }

  const initEl = () => {
    if (state.isInitDragEl === false) {
      const shadowEl = document.createElement("div");
      state.initEl = shadowEl;
      document.body.appendChild(state.initEl);
      state.isInitDragEl = true;
      initElSize();
    } else {
      initElSize();
    }
  }

  const removeEl = () => {
    if (state.initEl) {
      state.initEl.remove();
    }
  }

  const initElSize = () => {
    if (state.el) {
      const elRect = (state.el as HTMLElement).getBoundingClientRect();
      state.initEl.id = 'dragTargetShadowEl';
      state.initEl.style.position = 'absolute';
      state.initEl.style.top = `${elRect.top}px`;
      state.initEl.style.left = `${elRect.left}px`;
      state.initEl.style.width = `${elRect.width}px`;
      state.initEl.style.height = `${elRect.height}px`;
      state.initEl.style.zIndex = '900000000';
    }
  }

  const showShadowEl = () => {
    if (state.initEl) {
      state.initEl.style.display = 'block';
      state.initEl.style['pointer-events'] = '';
    }
  }

  const hideShadowEl = () => {
    if (state.initEl) {
      state.initEl.style.display = 'none';
      state.initEl.style['pointer-events'] = 'none';
    }
  }

  const isEventinTargetEl = (e: DragEvent) => {
    return (e.target as HTMLElement).id === 'dragTargetShadowEl';
  }

  const onDragEnterEvt = (e: DragEvent) => {
    if (state.beforeDragEnterCallback && state.beforeDragEnterCallback instanceof Function) {
      if(state.beforeDragEnterCallback() === false) {
        return;
      }
    }

    initEl();
    showShadowEl();

    if (state.isInitDragEl === true) {
      if (isEventinTargetEl(e)) {
        if (state.dragEnterCallback && state.dragEnterCallback instanceof Function) {
          state.dragEnterCallback(e);
        }
      }
    }
  }

  const onDragLeaveEvt = (e: DragEvent) => {
    if (state.beforeDragLeaveCallback && state.beforeDragLeaveCallback instanceof Function) {
      if(state.beforeDragLeaveCallback() === false) {
        return;
      }
    }

    if (state.isInitDragEl === true) {
      if (isEventinTargetEl(e)) {
        console.log("dragLeave");
        hideShadowEl();
        if (state.dragLeaveCallback && state.dragLeaveCallback instanceof Function) {
          state.dragLeaveCallback(e);
        }
      }
    }
  }

  const onDragover = (e: DragEvent) => e.preventDefault();

  const onDropEvt = (e: DragEvent) => {
    e.preventDefault();
    if (state.beforeDragLeaveCallback && state.beforeDropCallback instanceof Function) {
      if(state.beforeDropCallback() === false) {
        return;
      }
    }

    if (isEventinTargetEl(e)) {
      if (state.dropCallback && state.dropCallback instanceof Function) {
        state.dropCallback(e);
      }
    }
    hideShadowEl();
  }

  const addEvt = () => {
    document.addEventListener('dragenter', onDragEnterEvt, false);
    document.addEventListener('dragleave', onDragLeaveEvt, false);
    document.addEventListener('dragover', onDragover, false);
    document.addEventListener('drop', onDropEvt, false);
  }

  const removeEvt = () => {
    document.removeEventListener('dragenter', onDragEnterEvt, false);
    document.removeEventListener('dragleave', onDragLeaveEvt, false);
    document.removeEventListener('dragover', onDragover, false);
    document.removeEventListener('drop', onDropEvt, false);
  }

  const dispose = () => {
    removeEl();
    removeEvt();
  }

  return {
    initUseDrop: init,
    disposeUseDrop: dispose,
  }
}


export default useDropApi;
