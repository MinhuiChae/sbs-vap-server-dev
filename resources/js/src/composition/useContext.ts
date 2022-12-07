import { EmitsOptions, SetupContext } from "vue";

const useContext = (context: any) => {
  const useSlot = (findSlotNm: string): boolean => {
    return Object.keys(context.slots).findIndex((slotNm) => slotNm === findSlotNm) > -1;
  }

  const getSlotFilter = (filterType: string, filterName: string) => {
    if (filterType === 'end') {
      // console.log("1 ", Object.keys(context.slots).filter((slotKey) => slotKey.endsWith(filterName)));
      return Object.keys(context.slots).filter((slotKey) => slotKey.endsWith(filterName));
    }
  }

  return {
    useSlot,
    getSlotFilter,
  }
}

export default useContext;
