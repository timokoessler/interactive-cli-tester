import enquirer from 'enquirer';

(async () => {
    console.log('⌨️🧪 Prompt Test CLI with Enquirer');
    try {
        const formPrompt = new enquirer.Form({
            name: 'user',
            message: 'Please provide the following information:',
            choices: [
                { name: 'firstname', message: 'First Name', initial: 'Foo' },
                { name: 'lastname', message: 'Last Name', initial: 'Bar' },
                { name: 'username', message: 'GitHub username', initial: 'acme' },
            ],
        });

        const formAnswer = await formPrompt.run();
        console.log(`Name: ${formAnswer.firstname} ${formAnswer.lastname}, GitHub: ${formAnswer.username}`);

        const selectPrompt = new enquirer.MultiSelect({
            name: 'value',
            message: 'Pick your favorite programming languages',
            choices: [
                { name: 'TypeScript' },
                { name: 'C#' },
                { name: 'JavaScript' },
                { name: 'Go' },
                { name: 'Rust' },
                { name: 'Python' },
                { name: 'Java' },
                { name: 'C++' },
                { name: 'PHP' },
                { name: 'C' },
            ],
        });

        const selectAnswer = await selectPrompt.run();
        console.log(`Selected: ${selectAnswer.join(', ')}`);
    } catch {
        process.exit(1);
    }
})();
