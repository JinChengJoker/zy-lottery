#!/usr/bin/env node

import {Command} from "commander";
import {update, analyze} from "./index";

const program = new Command();

program
  .version('1.2.1')

program
  .command('fetch')
  .description('fetch all history data of lottery')
  .action(async () => {
    await update()
  });

program
  .command('run')
  .description('analyze the input data')
  .requiredOption('-f, --front <front>', 'input lottery front area')
  .option('-e, --end <end>', 'input lottery end area', '')
  .action(async (options) => {
    await analyze({
      lotteryFrontString: options.front,
      lotteryEndString: options.end,
    })
  });

program.parse(process.argv);