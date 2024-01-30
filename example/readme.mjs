import enquirer from 'enquirer';

(async () => {
    console.log('🚀 Test CLI with Enquirer');

    await new Promise((resolve) => setTimeout(resolve, 500));

    const actionPrompt = new enquirer.Select({
        name: 'value',
        message: 'What do you want to do?',
        choices: [{ name: 'Nothing' }, { name: 'Enter name' }, { name: 'Exit' }],
        initial: 0,
    });

    try {
        const action = await actionPrompt.run();

        switch (action) {
            case 'Enter name':
                break;
            default:
                process.exit(1);
                break;
        }

        const inputPrompt = new enquirer.Input({
            name: 'value',
            message: 'Input your name',
        });

        const value = await inputPrompt.run();

        console.log(`Hello ${value}!`);
        process.exit(0);
    } catch {
        process.exit(1);
    }
})();
