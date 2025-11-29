import {Injectable, Logger} from '@nestjs/common';
import {ManagerService} from "../manager/manager.service";
import {ws} from '../ws';
import path from "node:path";
import * as fs from 'fs/promises';
import {genId} from "../common/utils";
import {ChildProcess, spawn} from 'node:child_process';
import process from 'node:process';
import {HOST, PORT} from "../main";


export type Bot = {
  id: string,
  name: string,
  desc?: string,
  file: string,
  platform: string,
  symbol: string
}

const BOTS_LIST_FILE = path.join(process.cwd(), '../data/bots.json');

@Injectable()
export class BotsService {
  private readonly logger = new Logger(BotsService.name);

  managerService: ManagerService;
  private bots: Bot[];
  private botsById: Record<string, Bot> = {};
  private processes: Record<string, ChildProcess> = {};

  constructor() {
    ws.registerHandlers([
      ['getBotsList', this.getBotsList],
      ['createBot', this.createBot],
      ['deleteBot', this.deleteBot]
    ], this);
  };

  runBot(id: string) {
    const bot = this.botsById[id];
    if (!bot) {
      this.logger.warn(`startBot: bot not found: ${id}`);
      return {error: `Bot not found: ${id}`};
    }

    if (this.processes[id]) {
      this.logger.log(`startBot: "${bot.name}" bot already running: ${id}`);
      return {ok: true, alreadyRunning: true};
    }

    this.logger.log(`Starting bot "${bot.name}": ${id}`);

    const tsxBin = path.resolve(process.cwd(), 'node_modules/.bin/tsx');
    const dirPath = path.resolve(__dirname, '../../../scripts');
    const scriptPath = path.resolve(dirPath, 'bot.runtime.ts');

    const child = spawn(tsxBin, [scriptPath], {
      stdio: ['ignore', 'inherit', 'inherit'],
      cwd: dirPath,
      env: {
        ...process.env,
        FABRIQUANT_WS_URL: `ws://127.0.0.1:${PORT}/ws`,
        FABRIQUANT_BOT_ID: bot.id,
        FABRIQUANT_BOT_NAME: bot.name,
        FABRIQUANT_BOT_FILE: bot.file,
      },
    });

    this.processes[id] = child;

    child.on('exit', (code, signal) => {
      this.logger.log(`Bot process exited: id=${id}, code=${code}, signal=${signal}`);
      delete this.processes[id];
    });

    child.on('error', (err) => {
      this.logger.error(`Bot process "${bot.name}" error: id=${id}`, err as any);
      delete this.processes[id];
    });

    return {ok: true};
  }

  runAllBots() {
    return Promise.all(this.bots.map(bot => this.runBot(bot.id)));
  }

  getBot(id: string) {
    return this.bots.find(b => b.id === id);
  }

  async loadAllBotsList() {
    const content: string = await fs.readFile(BOTS_LIST_FILE, 'utf8');
    try {
      this.bots = JSON.parse(content);
    } catch (e) {
      return {error: 'Bad bots.json file'};
    }
    !this.bots.length && (await this.createBot());
    this.bots.forEach(bot => this.botsById[bot.id] = bot);
  }

  getBotsList() {
    return this.bots;
  }

  async createBot() {
    const id = genId(24);
    const bot: Bot = {
      id,
      name: `DemoBot ${this.bots.length + 1}`,
      desc: '',
      file: 'demo/index.ts',
      platform: 'bybit',
      symbol: 'BTCUSDT'
    }
    this.bots.push(bot);
    this.botsById[id] = bot;
    await this.saveBots();
    return bot;
  }

  async deleteBot(id: string) {
    const bot = this.getBot(id);
    if (!bot) return {error: "Can't find bot"}
    this.bots.splice(this.bots.indexOf(bot), 1);
    delete this.botsById[id];
    await this.saveBots();
    return this.bots;
  }

  async saveBots() {
    return fs.writeFile(BOTS_LIST_FILE, JSON.stringify(this.bots, null, 4));
  }
}
