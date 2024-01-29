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
        return await cliTest.waitForOutput('Chunked output continued', false);
    }).rejects.toThrow('Process exited before output "Chunked output continued" was found');
    await cliTest.waitForExit();
    expect(cliTest.getExitCode()).toBe(0);
});
