(async () => {
    process.stdout.write('Normal line\n', (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        process.stdout.write('Chunked output', async (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
            process.stdout.write(' continued\n', (err) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                process.exit(0);
            });
        });
    });
})();
