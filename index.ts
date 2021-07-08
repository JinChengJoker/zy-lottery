import axios from "axios";
import fs from "fs";
import readLine from "readline";

const fetchLotteryHistory = () => {
  const lotteryWriteStream = fs.createWriteStream('./lottery.db')
  const fetch: (pagination: { pageSize: number, pageNo: number }) => Promise<void> = (
    async ({pageSize, pageNo}) => {
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
  )
  void fetch({
    pageSize: 100,
    pageNo: 1
  })
}

const analyzeLotteryHistory: (lottery: { lotteryFrontString: string; lotteryEndString?: string }) => void =
  ({lotteryFrontString, lotteryEndString = ''}) => {
    const lotteryFront = lotteryFrontString.split(' ')
    const lotteryEnd = lotteryEndString.split(' ')

    const rl = readLine.createInterface({
      input: fs.createReadStream('./lottery.db'),
      crlfDelay: Infinity
    })

    console.log('分析中...')
    console.log('该组彩票历史中奖情况（七等奖以上）：')
    console.log('------------------------')

    rl.on('line', line => {
      const lotteryLine: Lottery = JSON.parse(line)
      const front: string[] = []
      const end: string[] = []
      lotteryLine.lotteryDrawFrontResult.forEach(i => {
        if (lotteryFront.includes(i)) front.push(i)
      })
      lotteryLine.lotteryDrawEndResult.forEach(i => {
        if (lotteryEnd.includes(i)) end.push(i)
      })
      if (front.length >= 4 || (front.length === 3 && end.length === 2)) {
        console.log(`${lotteryLine.lotteryDrawTime} 第${lotteryLine.lotteryDrawNum}期 ${front.join(' ')} ${end.length ? `+ ${end.join(' ')}` : ''}`)
      }
    })

    rl.on('close', () => {
      console.log('------------------------')
      console.log('分析完毕，祝早日中大奖！')
    })
  }

export {fetchLotteryHistory, analyzeLotteryHistory}