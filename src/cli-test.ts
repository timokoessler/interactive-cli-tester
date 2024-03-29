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
         * The maximum amount of time the process is allowed to run in milliseconds.
         * @default undefined
         */
        timeout?: number;
    };
};

const genericNotRunErr = (action: string) =>
    `Can not ${action} when CLI process is not running. Call run() first and ensure the process started and did not exit.`;

export class CLITest {
    private command: string;
    private args: string[];
    private childProcess: ChildProcessWithoutNullStreams | undefined;
    private running = false;
    private starting = false;
    private eventEmitter: EventEmitter;
    private output = '';
    private options: CLITestOptions;

    /**
     * Create a new CLI test instance.
     * If you want to measure the code coverage of a JS/TS CLI, you may want to prepend the node command with 'c8' or 'nyc'.
     * @param command The command that should be executed to start the CLI process.
     * @param args The arguments that should be passed.
     * @param options Additional options.
     */
    constructor(command: string, args: string[] = [], options = {} as CLITestOptions) {
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

    /**
     * Execute the CLI process.
     * Tip: You can call this method multiple times to restart the process, after the process has exited.
     * @throws If the process is already running or starting or if the command produces an error.
     * @returns A promise that resolves when the process has been started.
     */
    run(): Promise<void> {
        if (this.running || this.starting) {
            throw new Error('Process is already running or starting.');
        }
        this.starting = true;
        try {
            this.childProcess = spawn(this.command, this.args, {
                ...this.options.process,
            });
        } catch (err) {
            this.starting = false;
            throw new Error(`Error while starting child process: ${(err as Error).message}`);
        }

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
                this.kill();
                throw new Error(
                    `Failing because process wrote to stderr. Disable this behavior by setting failOnStderr to false.\n${dataString}`,
                );
            }
        });

        return new Promise((resolve, reject) => {
            const onSpawn = () => {
                this.eventEmitter.off('error', onError);
                resolve(undefined);
            };

            const onError = (err: Error) => {
                this.eventEmitter.off('spawn', onSpawn);
                reject(`Error starting child process: ${err.message}`);
            };

            this.eventEmitter.once('spawn', onSpawn);
            this.childProcess!.once('error', onError);
        });
    }

    /**
     * Wait for the process to exit.
     * If the process returns a non-zero exit code, the promise will not be rejected.
     * @throws If the process is not running or starting.
     * @returns A promise that resolves when the process exits with the exit code.
     */
    waitForExit(): Promise<number | null> {
        if (!this.running && !this.starting) {
            throw new Error(genericNotRunErr('wait for exit'));
        }
        return new Promise((resolve) => {
            this.eventEmitter.once('exit', (code) => {
                resolve(code);
            });
        });
    }

    /**
     * Wait for the process to write the given content to stdout or stderr.
     * If the process exits before the content is found, the promise will be rejected.
     * This method does not check past output, only output that is written after this method is called. For checking past output, use getOutput().
     * Per default this method is only able to find content that is written in a single chunk by the CLI process. If the content is split into multiple chunks set multipleChunks to true.
     *
     * @param content The string to wait for.
     * @param multipleChunks If true, the content can be split into multiple chunks. If false, the content must be written in a single chunk. Defaults to false.
     * @returns A promise that resolves when the content is found, or rejects if the process exits before the content is found.
     */
    waitForOutput(content: string, multipleChunks = false): Promise<void> {
        if (!this.running && !this.starting) {
            throw new Error(genericNotRunErr('wait for output'));
        }
        if (!content.length) {
            throw new Error('Output to wait for must not be empty.');
        }
        return new Promise((resolve, reject) => {
            if (!multipleChunks) {
                const onExit = () => {
                    this.eventEmitter.off('exit', onExit);
                    this.eventEmitter.off('output', onOutput);
                    reject(new Error(`Process exited before output "${content}" was found`));
                };
                this.eventEmitter.on('exit', onExit);
                const onOutput = (data: string) => {
                    if (data.includes(content)) {
                        this.eventEmitter.off('exit', onExit);
                        this.eventEmitter.off('output', onOutput);
                        return resolve(undefined);
                    }
                };
                this.eventEmitter.on('output', onOutput);
            } else {
                const startIndex = this.output.length;

                const onMultiChunkExit = () => {
                    this.eventEmitter.off('exit', onMultiChunkExit);
                    this.eventEmitter.off('output', onMultiChunkOutput);
                    reject(new Error(`Process exited before output "${content}" was found`));
                };
                this.eventEmitter.on('exit', onMultiChunkExit);
                const onMultiChunkOutput = () => {
                    const output = this.output.slice(startIndex);
                    if (output.includes(content)) {
                        this.eventEmitter.off('exit', onMultiChunkExit);
                        this.eventEmitter.off('output', onMultiChunkOutput);
                        return resolve(undefined);
                    }
                };
                this.eventEmitter.on('output', onMultiChunkOutput);
            }
        });
    }

    /**
     * Register a callback to listen for output (stdout and stderr) from the process.
     * @param callback A callback that will be called when the process writes to stdout or stderr with the output as a string.
     */
    onOutput(callback: (data: string) => void): void {
        this.eventEmitter.on('output', (data: string) => {
            callback(data);
        });
    }

    /**
     * Write data to stdin of the process.
     * @param data The data to write.
     * @returns A promise that resolves when the data has been written.
     */
    write(data: string | Buffer): Promise<void> {
        if (!this.running) {
            throw new Error(genericNotRunErr('write data to stdin'));
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

    /**
     * Kill the process.
     * @returns True if the process was killed successfully, false otherwise.
     */
    kill(): boolean {
        if (!this.running) {
            throw new Error(genericNotRunErr('kill process'));
        }
        if (!this.childProcess) {
            throw new Error('Child process is undefined. This should not happen.');
        }
        return this.childProcess.kill();
    }

    /**
     * Check if the process is running.
     * @returns True if the process is running, false otherwise.
     */
    isRunning(): boolean {
        return this.running;
    }

    /**
     * Get the exit code of the process. Returns null if the process has not exited yet. Throws an error if the process has not been run yet.
     * @returns The exit code of the process or null.
     */
    getExitCode(): number | null {
        if (!this.childProcess) {
            throw new Error(genericNotRunErr('get exit code'));
        }
        return this.childProcess.exitCode;
    }

    /**
     * Get the output of the process (stdout and stderr).
     * @returns The output of the process as a string.
     */
    getOutput(): string {
        return this.output;
    }

    /**
     * Get the next output chunk of the process (stdout and stderr).
     * This must not be a complete line, it can be a partial line, multiple lines or only one carriage return.
     * @returns The next chunk of the process as a string.
     */
    getNextOutput(): Promise<string> {
        if (!this.running && !this.starting) {
            throw new Error(genericNotRunErr('get next output'));
        }
        return new Promise((resolve, reject) => {
            const onExit = () => {
                this.eventEmitter.off('exit', onExit);
                this.eventEmitter.off('output', onOutput);
                reject(new Error('Process exited before next output was found'));
            };
            this.eventEmitter.on('exit', onExit);
            const onOutput = (data: string) => {
                this.eventEmitter.off('exit', onExit);
                resolve(data);
            };
            this.eventEmitter.once('output', onOutput);
        });
    }

    /**
     * Get the underlying child process for advanced usage.
     * @returns The underlying child process or undefined if the process has not been run yet.
     * @see https://nodejs.org/api/child_process.html#child_process_class_childprocess
     */
    getChildProcess(): ChildProcessWithoutNullStreams | undefined {
        return this.childProcess;
    }

    /**
     * Update the options of the CLI test instance. The current options will be merged with the new options.
     * @param options The options to change.
     */
    updateOptions(options: CLITestOptions): void {
        this.options = { ...this.options, ...options };
    }
}
