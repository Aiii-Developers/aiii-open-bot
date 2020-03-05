/**
 * 等待 {{microsecond}} 微秒執行
 * @param microsecond
 */
export const sleep = async (microsecond: number): Promise<void> => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, microsecond);
  });
