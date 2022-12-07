
const defaultRequestInit: RequestInit = {
  headers: {
    "Content-Type": "application/json",
  },
  mode: "cors",
}

const useFetch = (url: string, fetchParams: object): Promise<any> => {
  const params: RequestInit = Object.assign(JSON.parse(JSON.stringify(defaultRequestInit)), fetchParams);
  return new Promise((resolve, reject) => {
    fetch(url, params).then((response) => {
      resolve(response.json());
    }).catch((error) => {
      reject(error);
    });
  });
}


export default useFetch;
