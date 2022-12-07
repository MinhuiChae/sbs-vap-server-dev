


const useFileSize = () => {
  const getByteSize = (size: number): string => {
    const byteUnits = ["KB", "MB", "GB", "TB"];

    for (let i = 0; i < byteUnits.length; i++) {
      size = Math.floor(size / 1024);

      if (size < 1024) return size.toFixed(1) + byteUnits[i];
    }
  };

  const inValidateSize = (filesize: number, limitSize: number): boolean => {
    return filesize > limitSize;
  }

  return {
    getByteSize,
    inValidateSize
  }
}

export default useFileSize;
