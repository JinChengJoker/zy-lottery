#!/usr/bin/env node

import {Command} from "commander";
import {update, analyze} from "./index";
import pkg from './package.json'

const program = new Command();

program
  .version(pkg.version)

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
  .action(async (options: { front: string, end?: string }) => {
    const frontArray = options.front.trim().split(' ')
    const endArray = options.end?.trim().split(' ')
    if (frontArray.length < 5) {
      throw new Error('前区不能少于五个号码')
    }
    await analyze({
      frontArray,
      endArray,
    })
  });

program.parse(process.argv);