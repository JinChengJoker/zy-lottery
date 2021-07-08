import {program} from "commander";
import {analyzeLotteryHistory} from "./index";

program
  .option('-f, --front <front>', 'lottery front area')
  .option('-e, --end <end>', 'lottery end area')

program.parse(process.argv);

const options = program.opts();

let lotteryFrontString = ''
let lotteryEndString = ''

if (options.front) lotteryFrontString = options.front
if (options.end) lotteryEndString = options.end

analyzeLotteryHistory({
  lotteryFrontString, lotteryEndString
})