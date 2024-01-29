import { CLITest } from '../src/index';

const cliTest = new CLITest('node', ['test/cli/enquirer.mjs']);

const genericNotRunErr = (action: string) =>
    `Can not ${action} when CLI process is not running. Call run() first and ensure the process started and did not exit.`;

test('Expect error when not running', async () => {
    expect(() => cliTest.getExitCode()).toThrow(genericNotRunErr('get exit code'));
    expect(() => cliTest.kill()).toThrow(genericNotRunErr('kill process'));
    expect(() => cliTest.write('')).toThrow(genericNotRunErr('write data to stdin'));
    expect(() => cliTest.waitForOutput('')).toThrow(genericNotRunErr('wait for output'));
    expect(() => cliTest.waitForExit()).toThrow(genericNotRunErr('wait for exit'));
});

test('Expect error when running twice', async () => {
    await cliTest.run();
    expect(() => cliTest.run()).toThrow('Process is already running or starting.');
});

test('Invalid wait for output', async () => {
    expect(() => cliTest.waitForOutput('')).toThrow('Output to wait for must not be empty.');
    cliTest.kill();
});