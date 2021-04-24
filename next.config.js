module.exports = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.node = {
                fs: 'empty',
                net: 'empty',
                tls: 'empty'
            };
        }

        return config;
    },
    redirects: async () =>{

        return [
            {
                source: '/rankings',
                destination: "/rankings/0",
                permanent: true,
            },
            {
                source: '/match',
                destination: "/matches/",
                permanent: true,
            },
            {
                source: '/player',
                destination: "/players/",
                permanent: true,
            },
            {
                source: '/map',
                destination: "/maps/",
                permanent: true,
            }

        ]
    }
}