import axios from "axios";
import fs from "fs";
import os from "os";
import path from 'path';
import readLine from "readline";

const appDir = path.join(os.homedir(), '/AppData/local/zy-lottery');
const dbPath = path.join(appDir, '/lottery.db');
const checkPath = path.join(appDir, '.check');

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

const verifyLocalDatabase = async () => {
  console.log('正在检查数据更新...')
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir)
  }
  const check = parseInt(fs.readFileSync(checkPath, {flag: 'a+'}).toString()) || 0
  const lotteryValue = await fetchLotteryHistory({pageSize: 1, pageNo: 1})
  if (check === lotteryValue.total) {
    console.log('已是最新数据！')
    return 0
  } else {
    return lotteryValue.total - check
  }
}

const writeLotteryHistoryToDatabase = (lotteryValue: LotteryValue) => {
  const lotteryWriteStream = fs.createWriteStream(dbPath, {flags: 'a'})
  lotteryValue.list.reverse().forEach(item => {
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
  lotteryWriteStream.end()
  fs.writeFileSync(checkPath, lotteryValue.total.toString())
}

const update = async () => {
  const gap = await verifyLocalDatabase()
  if (gap > 0) {
    console.log('正在下载最新数据...')
    const pages = Math.ceil(gap / 100)
    const lastPageSize = gap % 100 || 100
    const fetchAndWrite = async (pageNo: number = pages) => {
      const lotteryValue = await fetchLotteryHistory({pageSize: 100, pageNo})
      if (pageNo === pages) {
        lotteryValue.list.splice(lastPageSize)
      }
      writeLotteryHistoryToDatabase(lotteryValue)
      if (pageNo > 1) {
        await fetchAndWrite(pageNo - 1)
      } else {
        console.log('数据已更新')
      }
    }
    await fetchAndWrite()
  }
}

const analyze: (lottery: { frontArray: string[]; endArray?: string[] }) => Promise<void> =
  async ({frontArray, endArray = []}) => {
    await update()
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
      lotteryLine.lotteryDrawFrontResult?.forEach(i => {
        if (frontArray.includes(i)) front.push(i)
      })
      lotteryLine.lotteryDrawEndResult?.forEach(i => {
        if (endArray.includes(i)) end.push(i)
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

export {update, analyze}