import { platform } from 'os';
import { ANSI, CLITest } from '../src/index';

const cliTest = new CLITest('node', ['test/cli/enquirer.mjs']);

test('Run and wait for output', async () => {
    expect(cliTest.isRunning()).toBe(false);

    await cliTest.run();

    await cliTest.waitForOutput('Test CLI with Enquirer');
    const testTime = new Date().getTime();
    await cliTest.waitForOutput('What do you want to do?');

    // Check that we waited for the output
    expect(Date.now() - testTime).toBeGreaterThan(400);
    expect(Date.now() - testTime).toBeLessThan(600);

    expect(cliTest.isRunning()).toBe(true);
});

test('Select option', async () => {
    // Cursor down (2x)
    await cliTest.write(ANSI.CURSOR_DOWN);
    await cliTest.write(ANSI.CURSOR_DOWN);
    await cliTest.write(ANSI.CR);

    await cliTest.waitForOutput('Input test value');
});

test('Input value and exit', async () => {
    await cliTest.write(`Tess${ANSI.BS}t${ANSI.CR}`);
    await cliTest.waitForOutput('Test value: Test');

    const exitCode = await cliTest.waitForExit();
    expect(exitCode).toBe(0);

    const exitCodeTwo = await cliTest.getExitCode();
    expect(exitCodeTwo).toBe(0);

    expect(cliTest.isRunning()).toBe(false);
    expect(cliTest.getOutput()).toContain('Test value: Test');
});

test('Run again', async () => {
    await cliTest.run();
    await cliTest.waitForOutput('What do you want to do?');
    expect(cliTest.isRunning()).toBe(true);
    expect(cliTest.getExitCode()).toBe(null);
});

test('Test onOutput', async () => {
    let output = '';
    cliTest.onOutput((data) => {
        output += data;
    });

    await cliTest.write(ANSI.CURSOR_DOWN);
    await cliTest.write(ANSI.CURSOR_DOWN);
    await cliTest.write(ANSI.CR);

    await cliTest.waitForOutput('Input test value');
    expect(output).toContain('Input test value');
});

test('Test kill', async () => {
    expect(cliTest.isRunning()).toBe(true);
    cliTest.kill();
    if (platform() === 'win32') {
        expect(await cliTest.waitForExit()).toBe(null);
    } else if (platform() === 'linux') {
        expect(await cliTest.waitForExit()).toBe(143);
    }
    expect(cliTest.isRunning()).toBe(false);
});
