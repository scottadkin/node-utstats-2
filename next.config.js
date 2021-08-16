module.exports = {
   
    webpack5: true,
    
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Important: return the modified config

        config.resolve.fallback = { 
            ...config.resolve.fallback,
            net: false,
            tls: false,
            fs: false

            //fs: false, net: false, tls: false, crypto: false, stream: false, timers: false
         };
  
        return config
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