
const useCustomEvent = () => {

  const disPacthEvent = (eventNm: string, params: any) => {
    document.dispatchEvent(new CustomEvent(eventNm, {
      detail: params
    }));
  }

  return {
    disPacthEvent
  }
}

export default useCustomEvent;
