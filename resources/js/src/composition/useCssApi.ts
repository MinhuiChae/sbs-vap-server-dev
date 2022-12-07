
const useCssApi = (cssPrefix: string) => {
  const getClassPrefix = (cssName: string): string => {
    return cssPrefix ? `${cssPrefix}-${cssName}` : `${cssName}`
  };

  return {
    getClassPrefix,
  }
}

export default useCssApi;
