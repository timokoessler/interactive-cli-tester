/** @type {import('jest').Config} */
export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest',
    },
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts'],
    testTimeout: 5000,
    coverageDirectory: 'coverage',
};
