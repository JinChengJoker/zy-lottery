import fs from "fs";
import readLine from 'readline';

const lotteryFrontString = '05 07 08 10 12 29'
const lotteryEndString = '01 03 09'

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