import axios from "axios";
import fs from "fs";

type Lottery = {
  lotteryDrawNum: string;
  lotteryDrawTime: string;
  lotteryDrawResult: string;
}

type Pagination = {
  pageNo: number,
  pages: number,
  pageSize: number,
}

interface LotteryValue extends Pagination {
  list: Lottery[],
}

const lotteryWriteStream = fs.createWriteStream('./lottery.db')

const fetch: (pagination: { pageSize: number, pageNo: number }) => Promise<void> = async ({pageSize, pageNo}) => {
  const response = await axios.get(
    `https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=${pageSize}&isVerify=1&pageNo=${pageNo}`
  ).catch(error => {
    console.log(error)
  })
  if (response) {
    const {errorCode, errorMessage} = response.data
    if (errorCode === '0') {
      const value: LotteryValue = response.data.value
      value.list.forEach((item: Lottery) => {
        // const front: string[] = []
        // const end: string[] = []
        // item.lotteryDrawResult.split(' ').slice(0, 5).forEach(i => {
        //   if (myLottery.slice(0, 6).includes(i)) front.push(i)
        // })
        // item.lotteryDrawResult.split(' ').slice(5).forEach(i => {
        //   if (myLottery.slice(6).includes(i)) end.push(i)
        // })
        // if (front.length >= 4 || (front.length === 3 && end.length === 2)) {
        //   lotteryWriteStream.write(`第 ${item.lotteryDrawNum} 期 [${front.join(' ')}] - [${end.join(' ')}]\n`)
        // }
        lotteryWriteStream.write(`${
          JSON.stringify({
            lotteryDrawNum: item.lotteryDrawNum,
            lotteryDrawTime: item.lotteryDrawTime,
            lotteryDrawResult: item.lotteryDrawResult
          })
        }\n`)
      })
      if (pageNo <= value.pages) {
        await fetch({
          pageSize: 100,
          pageNo: pageNo + 1,
        })
      } else {
        lotteryWriteStream.end()
      }
    } else {
      console.log(errorMessage)
    }
  }
}

void fetch({
  pageSize: 100,
  pageNo: 1
})