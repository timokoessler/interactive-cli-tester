import enquirer from 'enquirer';

(async () => {
    console.log('🚀 Test CLI with Enquirer');

    await new Promise((resolve) => setTimeout(resolve, 500));

    const actionPrompt = new enquirer.Select({
        name: 'value',
        message: 'What do you want to do?',
        choices: [{ name: 'Action A' }, { name: 'Action B' }, { name: 'Action C' }],
        initial: 0,
    });

    try {
        const action = await actionPrompt.run();

        switch (action) {
            case 'Action C':
                break;
            default:
                process.exit(1);
                break;
        }

        const inputPrompt = new enquirer.Input({
            name: 'value',
            message: 'Input test value',
        });

        const value = await inputPrompt.run();

        console.log(`Test value: ${value}`);
        process.exit(0);
    } catch {
        process.exit(1);
    }
})();
