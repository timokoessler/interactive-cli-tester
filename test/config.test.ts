import { CLITest } from '../src';

const cliTest = new CLITest('node', ['test/cli/chunked-output.mjs'], {
    process: {
        uid: -1,
    },
});

test('Expect error because of invalid uid', async () => {
    try {
        await cliTest.run();
        expect(true).toBe(false);
    } catch (e) {
        // Expect error
    }
});

test('Update options and expect process is now running', async () => {
    cliTest.updateOptions({
        process: {
            uid: undefined,
        },
    });
    await cliTest.run();
    expect(await cliTest.waitForExit()).toBe(0);
});
