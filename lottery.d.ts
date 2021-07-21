declare module "*.json" {
  const value: any;
  export default value;
}

type Lottery = {
  lotteryDrawNum: string;
  lotteryDrawTime: string;
  lotteryDrawResult: string;
  lotteryDrawFrontResult: string[],
  lotteryDrawEndResult: string[],
}

type Pagination = {
  pageNo: number,
  pages: number,
  pageSize: number,
}

interface LotteryValue extends Pagination {
  list: Lottery[],
  total: number,
}

interface LotteryResponse {
  errorCode: string,
  errorMessage: string,
  value: LotteryValue,
}