import axios from "axios";
import fs from "fs";
import os from "os";
import path from 'path';
import readLine from "readline";

const appDir = path.join(os.homedir(), '/AppData/local/zy-lottery');
const dbPath = path.join(appDir, '/lottery.db');

// const verifyLocalDatabase = async () => {
//   console.log(fs.existsSync(dbPath))
//   // 检查数据库文件是否存在
//   if (fs.existsSync(dbPath)) {
//     // 1、如果存在，就检查文件的行数，和API获取的总数对比，获取缺失的数据
//     await fetchLotteryHistory({pageSize: 1, pageNo: 1})
//   } else {
//     // 2、如果不存在，就创建数据库文件并获取所有数据
//     fs.mkdirSync(appDir)
//   }
// }

const fetchLotteryHistory: (pagination: { pageSize: number, pageNo: number }) => Promise<LotteryValue> =
  async ({pageSize, pageNo}) => {
    const response = await axios.get(
      `https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=${pageSize}&isVerify=1&pageNo=${pageNo}`
    ).catch(error => {
      throw error
    })
    const {errorCode, errorMessage, value}: LotteryResponse = response.data
    if (errorCode === '0') {
      return value
    } else {
      throw new Error(errorMessage)
    }
  }

const writeLotteryHistoryToDatabase = () => {
  console.log('正在下载数据...')
  const lotteryWriteStream = fs.createWriteStream(dbPath)
  const fetchAndWrite: (pageSize?: number, pageNo?: number) => void = async (pageSize = 100, pageNo = 1) => {
    const lotteryValue = await fetchLotteryHistory({pageSize, pageNo})
    lotteryValue.list.forEach(item => {
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
    if (pageNo < lotteryValue.pages) {
      fetchAndWrite(pageNo + 1)
    } else {
      lotteryWriteStream.end()
      console.log('下载完毕')
    }
  }
  fetchAndWrite()
}

const analyzeLotteryHistory: (lottery: { lotteryFrontString: string; lotteryEndString?: string }) => void =
  ({lotteryFrontString, lotteryEndString = ''}) => {
    const lotteryFront = lotteryFrontString.split(' ')
    const lotteryEnd = lotteryEndString.split(' ')
    const rl = readLine.createInterface({
      input: fs.createReadStream(dbPath),
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

export {writeLotteryHistoryToDatabase, analyzeLotteryHistory}