import { CLITest } from '../src';
const cliTest = new CLITest('node', ['test/cli/chunked-output.mjs']);

test('Read output with multipleChunks = true', async () => {
    await cliTest.run();
    await cliTest.waitForOutput('Normal line', true);
    await cliTest.waitForOutput('Chunked output continued', true);
    await cliTest.waitForExit();
    expect(cliTest.getExitCode()).toBe(0);
});

test('Fail reading output with multipleChunks = false', async () => {
    await cliTest.run();
    await cliTest.waitForOutput('Normal line', false);
    expect(async () => {
        await cliTest.waitForOutput('Chunked output continued', false);
    }).rejects.toThrow('Process exited before output "Chunked output continued" was found');
    await cliTest.waitForExit();
    expect(cliTest.getExitCode()).toBe(0);
});

test('Expect error when calling getNextOutput directly before exit', async () => {
    await cliTest.run();
    await cliTest.waitForOutput('Normal line', true);
    await cliTest.waitForOutput('Chunked output continued', true);
    expect(async () => {
        await cliTest.getNextOutput();
    }).rejects.toThrow('Process exited before next output was found');
    await cliTest.waitForExit();
    expect(cliTest.getExitCode()).toBe(0);
});

test('Expect error when calling waitForOutput (chunked) directly before exit', async () => {
    await cliTest.run();
    await cliTest.waitForOutput('Normal line', true);
    await cliTest.waitForOutput('Chunked output continued', true);
    expect(async () => {
        await cliTest.waitForOutput('Normal line 2', true);
    }).rejects.toThrow('Process exited before output "Normal line 2" was found');
    expect(await cliTest.waitForExit()).toBe(0);
});
