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
  list: Lottery[]
}