(async () => {
    process.stdout.write('Normal line\n', (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        process.stdout.write('Chunked output', (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
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
