const useCommon = {
  getApiUrl: () => {
    return process.env.MIX_API_URL;
  },
  getFaceApiUrl: () => {
    return process.env.MIX_API_URL;
  },
  getApiTest: () => {
    return process.env.MIX_API_TEST;
  }
}

export default useCommon
