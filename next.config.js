/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: "/dashboard",
                destination: "/dashboard/sales",
                permanent: true,
            },
        ];
    },
};
module.exports = nextConfig;
