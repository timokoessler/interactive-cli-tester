import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';

/**
 * Additonal options that can be passed to the CLITest constructor.
 */
export type CLITestOptions = {
    /**
     * Throw an error if the process writes to stderr.
     * @default true
     */
    failOnStderr?: boolean;
    /**
     * The encoding to use for decoding the output.
     * @default 'utf-8'
     */
    outputEncoding?: BufferEncoding;
    process?: {
        /**
         * Current working directory of the process to be spawned.
         */
        cwd?: string;
        /**
         * Pass environment variables to the cli process.
         * @default process.env
         */
        env?: NodeJS.ProcessEnv;
        /**
         * Sets the user identity of the process.
         */
        uid?: number;
        /**
         * Sets the group identity of the process.
         */
        gid?: number;
        /**
         * Tte maximum amount of time the process is allowed to run in milliseconds.
         * @default undefined
         */
        timeout?: number;
    };
};

export class CLITest {
    private command: string;
    private args: string[];
    private childProcess: ChildProcessWithoutNullStreams | undefined;
    private running = false;
    private starting = false;
    private eventEmitter: EventEmitter;
    private output = '';
    private options: CLITestOptions;

    constructor(command: string, args: string[], options = {} as CLITestOptions) {
        this.command = command;
        this.args = args;
        this.eventEmitter = new EventEmitter();

        const defaultOptions: CLITestOptions = {
            failOnStderr: true,
            outputEncoding: 'utf-8',
            process: {},
        };

        this.options = { ...defaultOptions, ...options };
    }

    run(): Promise<void> {
        if (this.running || this.starting) {
            throw new Error('Process already running');
        }
        this.starting = true;
        this.childProcess = spawn(this.command, this.args, {
            ...this.options.process,
        });

        this.childProcess.on('spawn', () => {
            this.running = true;
            this.starting = false;
            this.eventEmitter.emit('spawn');
        });

        this.childProcess.on('exit', (code) => {
            this.running = false;
            this.starting = false;
            this.eventEmitter.emit('exit', code);
        });

        this.childProcess.stdout.on('data', (data: Buffer) => {
            const dataString = data.toString(this.options.outputEncoding);
            this.output += dataString;
            this.eventEmitter.emit('output', dataString);
        });

        this.childProcess.stderr.on('data', (data: Buffer) => {
            const dataString = data.toString(this.options.outputEncoding);
            this.output += dataString;
            this.eventEmitter.emit('output', dataString);
            if (this.options.failOnStderr) {
                throw new Error(`Process wrote to stderr: ${dataString}`);
            }
        });

        return new Promise((resolve) => {
            this.eventEmitter.once('spawn', () => {
                resolve(undefined);
            });
        });
    }

    waitForExit(): Promise<number | null> {
        if (!this.running && !this.starting) {
            throw new Error('Cannot wait for exit when process is not running');
        }
        return new Promise((resolve) => {
            this.eventEmitter.once('exit', (code) => {
                resolve(code);
            });
        });
    }

    waitForOutput(content: string): Promise<void> {
        if (!this.running && !this.starting) {
            throw new Error('Cannot wait for output when process is not running');
        }
        return new Promise((resolve, reject) => {
            this.eventEmitter.on('output', (data: string) => {
                if (data.includes(content)) {
                    resolve(undefined);
                }
            });
            this.eventEmitter.on('exit', () => {
                reject(new Error(`Process exited before output "${content}" was found`));
            });
        });
    }

    onOutput(callback: (data: string) => void): void {
        this.eventEmitter.on('output', (data: string) => {
            callback(data);
        });
    }

    write(data: string | Buffer): Promise<void> {
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

    getOutput(): string {
        return this.output;
    }
}
