#!/usr/bin/env node

import {Command} from "commander";
import {writeLotteryHistoryToDatabase, analyzeLotteryHistory} from "./index";

const program = new Command();

program
  .version('1.0.0.')

program
  .command('fetch')
  .description('fetch all history data of lottery')
  .action(() => {
    writeLotteryHistoryToDatabase()
  });

program
  .command('run')
  .description('analyze the input data')
  .requiredOption('-f, --front <front>', 'input lottery front area')
  .option('-e, --end <end>', 'input lottery end area', '')
  .action((options) => {
    analyzeLotteryHistory({
      lotteryFrontString: options.front,
      lotteryEndString: options.end,
    })
  });

program.parse(process.argv);