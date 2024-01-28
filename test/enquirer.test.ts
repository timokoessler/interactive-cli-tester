import { CLITest } from '../src/index';

test('Run enquirer cli', async () => {
    const cliTest = new CLITest('node', ['test/cli/enquirer.mjs']);

    await cliTest.run();

    // Debug
    // cliTest.onOutput(console.log);

    await cliTest.waitForOutput('Test CLI with Enquirer');
    const testTime = new Date().getTime();
    await cliTest.waitForOutput('What do you want to do?');
    expect(Date.now() - testTime).toBeGreaterThan(400);
    expect(Date.now() - testTime).toBeLessThan(600);

    // Cursor down
    await cliTest.write('\x1b[B');
    await cliTest.write('\x1b[B');

    // Enter
    await cliTest.write('\r');

    const exitCode = await cliTest.waitForExit();
    expect(exitCode).toBe(0);
});
