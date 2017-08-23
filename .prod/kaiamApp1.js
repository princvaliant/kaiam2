module.exports = {
    servers: {
        one: {
            host: '138.68.2.121',
            username: 'root',
            password: 'Ka1amC00lC10ud'
        }
    },

    meteor: {
        name: 'kaiam',
        path: '..',
        // lets you add docker volumes (optional)
        docker: {
            image: 'abernix/meteord:base'
        },

        // list of servers to deploy, from the 'servers' list
        servers: {
            one: {}
        },

        buildOptions: {
            // skip building mobile apps, but still build the web.cordova architecture
            serverOnly: true,
            debug: false,
            cleanAfterBuild: true, // default
            allowIncompatibleUpdates: true
        },
        env: {
            PORT: 80, // useful when deploying multiple instances (optional)
            ROOT_URL: 'http://138.68.2.121', // If you are using ssl, this needs to start with https
            CLUSTER_WORKERS_COUNT: "auto",
            MONGO_URL: "mongodb://Miljenko:ka1amc00lc10ud@cloud.kaiamcorp.com:27017/KaiamApp?ssl=true",
            MONGO_OPLOG_URL: "mongodb://Miljenko:ka1amc00lc10ud@cloud.kaiamcorp.com:27017/local?authSource=KaiamApp&ssl=true"

        },
        deployCheckWaitTime: 260, // default 10
        // lets you define which port to check after the deploy process, if it
        // differs from the meteor port you are serving
        // (like meteor behind a proxy/firewall) (optional)
        deployCheckPort: 80,

        // Shows progress bar while uploading bundle to server (optional)
        // You might need to disable it on CI servers
        enableUploadProgressBar: true // default false.
    }
};
