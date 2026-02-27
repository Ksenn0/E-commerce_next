/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qvaowgbsjhclbakgadzv.supabase.co',  // seu hostname exato aqui
        port: '',                                      // deixe vazio
        pathname: '/storage/v1/object/public/**',      // permite todos os caminhos públicos do storage
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
