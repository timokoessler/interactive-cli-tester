# Interactive CLI Tester

[![npm version](https://badgen.net/npm/v/interactive-cli-tester)](https://www.npmjs.com/package/interactive-cli-tester)
[![npm downloads](https://badgen.net/npm/dt/interactive-cli-tester)](https://www.npmjs.com/package/interactive-cli-tester)
[![license](https://badgen.net/github/license/timokoessler/interactive-cli-tester)](https://github.com/timokoessler/interactive-cli-tester/blob/main/LICENSE)
[![CodeFactor](https://www.codefactor.io/repository/github/timokoessler/interactive-cli-tester/badge)](https://www.codefactor.io/repository/github/timokoessler/interactive-cli-tester)
[![codecov](https://codecov.io/gh/timokoessler/interactive-cli-tester/graph/badge.svg?token=N3E9VX3ELT)](https://codecov.io/gh/timokoessler/interactive-cli-tester)
[![install size](https://packagephobia.com/badge?p=interactive-cli-tester)](https://packagephobia.com/result?p=interactive-cli-tester)

A tool for testing interactive command line interfaces that require keyboard input.

> ⚠️ This software is still in development and not ready for production use.

You can find a complete API documentation [here](https://cli-tester.tkoessler.de).

## Features

-   Test every command line interface - no matter in which programming language it is written 🧪
-   Test interactive command line interfaces that require user input ⌨️
-   Independent of the testing framework you want to use 😎
-   Zero dependencies 📦

## Getting Started

You can install this package using npm:

```bash
npm install --save-dev interactive-cli-tester
```

The following example shows how to test a simple interactive CLI build with [enquirer](https://github.com/enquirer/enquirer) using [Jest](https://jestjs.io/). But you can use any Node.js testing framework you want.

```javascript
import { CLITest, ANSI } from 'interactive-cli-tester';

test('Test example CLI', async () => {
    const cliTest = new CLITest('node', ['examples/readme.mjs']);

    // Start the process, you can re-use the same instance for multiple runs
    await cliTest.run();

    // Wait until the CLI asks for input
    await cliTest.waitForOutput('What do you want to do?');
    // Equivalent to pressing down arrow and enter
    await cliTest.write(ANSI.CURSOR_DOWN + ANSI.CR);

    // Expect the CLI to ask for the name
    await cliTest.waitForOutput('Input your name');
    await cliTest.write('Acme' + ANSI.CR);

    // Wait for the process to exit and check the exit code
    expect(await cliTest.waitForExit()).toBe(0);

    // Check that the output contains the expected text
    expect(cliTest.getOutput().includes('Hello Acme!')).toBe(true);
});
```

A complete API documentation including all available methods and options can be found [here](https://cli-tester.tkoessler.de).

## Code Coverage

It can be difficult to configure your testing framework to collect code coverage for Node.js child processes. For example, Jest does not support this out of the box ([#5274](https://github.com/jestjs/jest/issues/5274)), even though [bcoe/c8](https://github.com/bcoe/c8) and [istanbuljs/nyc](https://github.com/istanbuljs/nyc) do. One possible workaround for Jest is described in [this comment](https://github.com/jestjs/jest/issues/3190#issuecomment-354758036), but this is not a perfect solution and may not work when using TypeScript.

You can find a complicated and not perfect workaround using two seperate Jest runners and nyc in my repo [timokoessler/docker-deploy-api](https://github.com/timokoessler/docker-deploy-api). I am not using c8 because of the issue [#462](https://github.com/bcoe/c8/issues/462).

If you have a question, have found a better way or successfully used another testing framework, please create an issue or send me a message.

## Sources

-   [ANSI Escape Sequences](https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797)

## Contact

If a public GitHub issue or discussion is not the right choice for your concern, you can contact me directly:

-   E-Mail: [info@timokoessler.de](mailto:info@timokoessler.de)

## License

© [Timo Kössler](https://timokoessler.de) 2024  
Released under the [MIT license](https://github.com/timokoessler/interactive-cli-tester/blob/main/LICENSE)
