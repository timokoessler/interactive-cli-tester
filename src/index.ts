import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';

export class CLITest {
    private command: string;
    private args: string[];
    private childProcess: ChildProcessWithoutNullStreams | undefined;
    private isRunning = false;
    private isStarting = false;
    private eventEmitter: EventEmitter;

    constructor(command: string, args: string[]) {
        this.command = command;
        this.args = args;
        this.eventEmitter = new EventEmitter();
    }

    async run(): Promise<void> {
        if (this.isRunning || this.isStarting) {
            throw new Error('Process already running');
        }
        this.isStarting = true;
        this.childProcess = spawn(this.command, this.args);

        this.childProcess.on('spawn', () => {
            this.isRunning = true;
            this.isStarting = false;
            this.eventEmitter.emit('spawn');
        });

        this.childProcess.on('exit', (code) => {
            this.isRunning = false;
            this.eventEmitter.emit('exit', code);
        });

        this.childProcess.stdout.on('data', (data: Buffer) => {
            this.eventEmitter.emit('stdout', data.toString());
        });

        /*this.childProcess.stderr.on('data', (data: Buffer) => {
            console.error(`Received stderr: ${data}`);
        });*/

        return new Promise((resolve) => {
            this.eventEmitter.once('spawn', () => {
                resolve(undefined);
            });
        });
    }

    async waitForExit(): Promise<number | null> {
        if (!this.isRunning && !this.isStarting) {
            throw new Error('Cannot wait for exit when process is not running');
        }
        return new Promise((resolve) => {
            this.eventEmitter.once('exit', (code) => {
                resolve(code);
            });
        });
    }

    async waitForOutput(content: string): Promise<void> {
        if (!this.isRunning && !this.isStarting) {
            throw new Error('Cannot wait for output when process is not running');
        }
        return new Promise((resolve) => {
            this.eventEmitter.on('stdout', (data: string) => {
                if (data.includes(content)) {
                    resolve(undefined);
                }
            });
        });
    }

    onOutput(callback: (data: string) => void): void {
        this.eventEmitter.on('stdout', (data: string) => {
            callback(data);
        });
    }

    async write(data: string): Promise<void> {
        if (!this.isRunning) {
            throw new Error('Cannot write when process is not running');
        }
        return new Promise((resolve, reject) => {
            if (!this.childProcess) {
                return reject(new Error('Child process is undefined'));
            }
            this.childProcess.stdin.write(data, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(undefined);
            });
        });
    }
}
