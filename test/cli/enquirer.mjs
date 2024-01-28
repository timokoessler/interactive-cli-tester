import enquirer from 'enquirer';

(async () => {
    console.log('🚀 Test CLI with Enquirer');

    await new Promise((resolve) => setTimeout(resolve, 500));

    const actionPrompt = new enquirer.Select({
        name: 'value',
        message: 'What do you want to do?',
        choices: [{ name: 'Action A' }, { name: 'Action B' }, { name: 'Exit' }],
        initial: 0,
    });

    try {
        const action = await actionPrompt.run();

        switch (action) {
            case 'Action A':
                process.exit(1);
                break;
            case 'Action B':
                process.exit(2);
                break;
            case 'Exit':
                process.exit(0);
        }
    } catch {
        process.exit(1);
    }
})();
