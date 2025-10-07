/** @type {import('turbo').Config} */
module.exports = {
    // Global dependencies that affect all tasks
    globalDependencies: ['**/.env.*local'],

    // Pipeline configuration
    pipeline: {
        build: {
            dependsOn: ['^build'],
            outputs: ['.next/**', '!.next/cache/**', 'dist/**'],
            env: ['NODE_ENV', 'NEXT_PUBLIC_*']
        },
        dev: {
            cache: false,
            persistent: true,
            env: ['NODE_ENV', 'NEXT_PUBLIC_*']
        },
        lint: {
            dependsOn: ['^lint'],
            outputs: []
        },
        'type-check': {
            dependsOn: ['^type-check'],
            outputs: []
        },
        test: {
            dependsOn: ['^build'],
            outputs: ['coverage/**'],
            env: ['NODE_ENV']
        },
        clean: {
            cache: false,
            outputs: []
        }
    },

    // Remote caching configuration
    remoteCache: {
        enabled: true
    }
};
