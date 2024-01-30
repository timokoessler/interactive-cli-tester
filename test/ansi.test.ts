import { ANSI, CLITest } from '../src/index';

const cliTest = new CLITest('node', ['test/cli/many-prompts.mjs']);

test('Run and wait for first prompt', async () => {
    expect(cliTest.isRunning()).toBe(false);
    await cliTest.run();
    expect(cliTest.isRunning()).toBe(true);
    expect((await cliTest.getNextOutput()).includes('Prompt Test CLI with Enquirer')).toBe(true);

    await cliTest.waitForOutput('Please provide the following information:');
});

test('Test form input', async () => {
    await cliTest.write('John');
    await cliTest.write(ANSI.CURSOR_DOWN);
    await cliTest.write(ANSI.CURSOR_DOWN);
    await cliTest.write(ANSI.TAB);
    await cliTest.write(ANSI.CURSOR_UP);
    await cliTest.write('NolAn.');
    await cliTest.write(ANSI.BS);
    await cliTest.write(ANSI.CURSOR_BACK);
    await cliTest.write(ANSI.DEL);
    await cliTest.write('a');
    await cliTest.write(ANSI.CURSOR_FORWARD);
    await cliTest.write(ANSI.CURSOR_FORWARD);
    await cliTest.write('!');
    await cliTest.write(ANSI.CR);
    await cliTest.waitForOutput('Name: John Nolan!, GitHub: acme');
});

test('Test multi select', async () => {
    await cliTest.write(ANSI.SPACE);
    await cliTest.write(ANSI.CURSOR_DOWN);
    await cliTest.write(ANSI.CURSOR_DOWN);
    await cliTest.write(ANSI.SPACE);
    await cliTest.write(ANSI.CR);
    await cliTest.waitForOutput('Selected: TypeScript, JavaScript');
    expect(await cliTest.waitForExit()).toBe(0);
});

test('Cancel with ESC', async () => {
    await cliTest.run();
    await cliTest.waitForOutput('Please provide the following information:');
    await cliTest.write(ANSI.ESC);
    expect(await cliTest.waitForExit()).toBe(1);
});
