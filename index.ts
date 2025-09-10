import 'expo-router/entry';
import { createServer, Server } from 'miragejs';

declare global {
  interface Window {
    server: Server;
  }
}

if (__DEV__) {
  if (window.server) {
    window.server.shutdown();
  }
  window.server = createServer({
    routes() {
      this.post('/login', (schema, request) => {
        const { username, password } = JSON.parse(request.requestBody);

        if (username === 'user0' && password === '1234') {
          return {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            user: {
              id: 'user0',
              name: 'morkim',
              description: 'programmer, developer',
              profileImage:
                'https://avatars.githubusercontent.com/u/123456789?v=4',
            },
          };
        } else {
          return new Response(
            JSON.stringify({ message: 'Invalid credentials' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      });
    },
  });
}
