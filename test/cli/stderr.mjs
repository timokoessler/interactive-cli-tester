(async () => {
    console.error('Output to stderr');
    await new Promise((resolve) => setTimeout(resolve, 2000));
})();
