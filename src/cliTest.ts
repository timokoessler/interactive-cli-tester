import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';

export class CLITest {
    private command: string;
    private args: string[];
    private childProcess: ChildProcessWithoutNullStreams | undefined;
    private running = false;
    private starting = false;
    private eventEmitter: EventEmitter;
    private output = '';

    constructor(command: string, args: string[]) {
        this.command = command;
        this.args = args;
        this.eventEmitter = new EventEmitter();
    }

    async run(): Promise<void> {
        if (this.running || this.starting) {
            throw new Error('Process already running');
        }
        this.starting = true;
        this.childProcess = spawn(this.command, this.args);

        this.childProcess.on('spawn', () => {
            this.running = true;
            this.starting = false;
            this.eventEmitter.emit('spawn');
        });

        this.childProcess.on('exit', (code) => {
            this.running = false;
            this.eventEmitter.emit('exit', code);
        });

        this.childProcess.stdout.on('data', (data: Buffer) => {
            const dataString = data.toString();
            this.output += dataString;
            this.eventEmitter.emit('stdout', dataString);
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
        if (!this.running && !this.starting) {
            throw new Error('Cannot wait for exit when process is not running');
        }
        return new Promise((resolve) => {
            this.eventEmitter.once('exit', (code) => {
                resolve(code);
            });
        });
    }

    async waitForOutput(content: string): Promise<void> {
        if (!this.running && !this.starting) {
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

    async write(data: string | Buffer): Promise<void> {
        if (!this.running) {
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

    kill(): boolean {
        if (!this.running) {
            throw new Error('Cannot kill when process is not running');
        }
        if (!this.childProcess) {
            throw new Error('Child process is undefined. Run the process first.');
        }
        return this.childProcess.kill();
    }

    isRunning(): boolean {
        return this.running;
    }

    getExitCode(): number | null {
        if (!this.childProcess) {
            throw new Error('Child process is undefined. Run the process first.');
        }
        return this.childProcess.exitCode;
    }
}
