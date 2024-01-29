import { CLITest } from '../src';

test('Do fail because of output to stderr', async () => {
    expect(async () => {
        const stdErrTest = new CLITest('node', ['test/cli/stderr.mjs'], {
            failOnStderr: true,
        });
        await stdErrTest.run();
        await stdErrTest.waitForExit();
    }).rejects.toThrow('Process wrote to stderr.');
});
