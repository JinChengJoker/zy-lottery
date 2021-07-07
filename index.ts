import axios from "axios";
import fs from "fs";

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
      value.list.forEach(item => {
        const lotteryDrawResultArray = item.lotteryDrawResult.split(' ')
        lotteryWriteStream.write(`${
          JSON.stringify({
            lotteryDrawNum: item.lotteryDrawNum,
            lotteryDrawTime: item.lotteryDrawTime,
            lotteryDrawResult: item.lotteryDrawResult,
            lotteryDrawFrontResult: lotteryDrawResultArray.slice(0, 5),
            lotteryDrawEndResult: lotteryDrawResultArray.slice(5),
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