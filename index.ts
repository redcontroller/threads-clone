import 'expo-router/entry';
import {
  belongsTo,
  createServer,
  Factory,
  hasMany,
  Model,
  Response,
  RestSerializer,
  Server,
} from 'miragejs';

import { faker } from '@faker-js/faker';

declare global {
  interface Window {
    server: Server;
  }
}

let user0: any;

if (__DEV__) {
  if (window.server) {
    window.server.shutdown();
  }
  window.server = createServer({
    // data 관계 정의
    models: {
      user: Model.extend({
        posts: hasMany('post'),
        activities: hasMany('activity'),
      }),
      post: Model.extend({
        user: belongsTo('user'),
      }),
      activity: Model.extend({
        user: belongsTo('user'),
        post: belongsTo('post'),
      }),
      search: Model.extend({
        user: belongsTo('user'),
        post: belongsTo('post'),
      }),
    },
    // 데이터 형식 정의
    serializers: {
      post: RestSerializer.extend({
        include: ['user'],
        embed: true,
      }),
      activity: RestSerializer.extend({
        include: ['user'],
        embed: true,
      }),
      search: RestSerializer.extend({
        include: ['user', 'post'],
        embed: true,
      }),
    },
    // 데이터 생성
    factories: {
      user: Factory.extend({
        id: () => faker.person.firstName(),
        name: () => faker.person.fullName(),
        description: () => faker.lorem.sentence(),
        profileImageUrl: () =>
          `https://avatars.githubusercontent.com/u/${Math.floor(
            Math.random() * 100_000
          )}?v=4`,
        isVerified: () => Math.random() > 0.5,
      }),
      post: Factory.extend({
        id: () => faker.string.numeric(6),
        content: () => faker.lorem.paragraph(),
        imageUrls: () =>
          Array.from({ length: Math.floor(Math.random() * 3) }, () =>
            // faker.image.urlLoremFlickr({ category: 'nature' })
            faker.image.urlPicsumPhotos()
          ),
        // location: () => [faker.location.latitude(), faker.location.longitude()],
        likes: () => Math.floor(Math.random() * 100),
        comments: () => Math.floor(Math.random() * 100),
        reposts: () => Math.floor(Math.random() * 100),
      }),
      activity: Factory.extend({
        id: () => faker.string.uuid(),
        type: () => {
          const types = [
            'followed',
            'reply',
            'like',
            'repost',
            'mention',
            'quote',
            'verified',
          ];
          return types[Math.floor(Math.random() * types.length)];
        },
        content: () => 'interacted with your content', // 기본값, seeds에서 업데이트
        timeAgo: () => {
          const times = [
            '1m',
            '5m',
            '10m',
            '30m',
            '1h',
            '2h',
            '5h',
            '1d',
            '2d',
            '1w',
          ];
          return times[Math.floor(Math.random() * times.length)];
        },
        otherCount: () =>
          Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : undefined,
        likes: () =>
          Math.random() > 0.5 ? Math.floor(Math.random() * 50) : undefined,
        isRead: () => Math.random() > 0.3,
        isVerified: () => false, // 기본값은 false
      }),
      search: Factory.extend({
        id: () => faker.person.firstName(),
        name: () => faker.person.fullName(),
        content: () => faker.lorem.sentence(),
        profileImageUrl: () =>
          `https://avatars.githubusercontent.com/u/${Math.floor(
            Math.random() * 100_000
          )}?v=4`,
        followers: () => Math.floor(Math.random() * 10000),
        isFollowed: () => Math.random() > 0.5,
        isConnections: () => Math.random() > 0.2,
        isVerified: () => Math.random() > 0.7,
      }),
    },
    // 데이터 초기화
    seeds(server) {
      user0 = server.create('user', {
        id: 'user0',
        name: 'User0',
        description: 'programmer, developer',
        profileImageUrl:
          'https://avatars.githubusercontent.com/u/123456789?v=4',
      });
      const users = server.createList('user', 10);
      users.forEach((user) => {
        server.createList('post', 5, {
          user,
        });
      });
      server.createList('post', 5, { user: user0 });

      // Search 더미 데이터 생성
      server.createList('search', 20);

      // Activity 더미 데이터 생성
      const allUsers = [user0, ...users];
      allUsers.forEach((user) => {
        // 각 사용자별로 다양한 타입의 activity 생성
        const activities = server.createList('activity', 10, { user });

        // type에 따라 적절한 content와 isVerified 설정
        const typeContentMap: { [key: string]: string } = {
          followed: 'started following you',
          reply: 'replied to your post',
          like: 'liked your post',
          repost: 'reposted your post',
          mention: 'mentioned you',
          quote: 'quoted your post',
          verified: 'verified your account',
        };

        activities.forEach((activity: any) => {
          const content =
            typeContentMap[activity.type] || 'interacted with your content';
          const isVerified = activity.type === 'verified';
          activity.update({ content, isVerified });
        });
      });
    },
    // 데이터 접근 정의
    routes() {
      this.post('/posts', async (schema, request) => {
        const formData = request.requestBody as unknown as FormData;
        const posts: Record<string, string | string[]>[] = [];
        formData.forEach(async (value, key) => {
          const match = key.match(/posts\[(\d+)\]\[(\w+)\](\[(\d+)\])?$/);
          console.log('key', key, match, value);
          if (match) {
            const [, index, field, , imageIndex] = match;
            const i = parseInt(index);
            const imgI = parseInt(imageIndex);
            if (!posts[i]) {
              posts[i] = {};
            }
            if (field === 'imageUrls') {
              if (!posts[i].imageUrls) {
                posts[i].imageUrls = [] as string[];
              }
              (posts[i].imageUrls as string[])[imgI] = (
                value as unknown as { uri: string }
              ).uri;
            } else if (field === 'location') {
              posts[i].location = JSON.parse(value as string);
            } else {
              posts[i][field] = value as string;
            }
          }
        });
        console.log('posts', posts);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        posts.forEach((post: any) => {
          schema.create('post', {
            id: post.id,
            content: post.content,
            imageUrls: post.imageUrls,
            location: post.location,
            user: schema.find('user', user0?.id),
          });
        });
        return posts;
      });

      this.get('/posts', (schema, request) => {
        console.log('request', request.queryParams);
        let posts = schema.all('post');
        // console.log('posts', posts);
        if (request.queryParams.type === 'following') {
          posts = posts.filter((post: any) => post.user?.id === user0?.id);
        }
        let targetIndex = -1;
        if (request.queryParams.cursor) {
          targetIndex = posts.models.findIndex(
            (v) => v.id === request.queryParams.cursor
          );
        }
        return posts
          .sort((a, b) => parseInt(b.id) - parseInt(a.id))
          .slice(targetIndex + 1, targetIndex + 11); // 최신순 정렬
      });

      this.get('/posts/:id', (schema, request) => {
        // console.log('request', request.params.id);
        return schema.find('post', request.params.id);
      });

      this.get('/posts/:id/comments', (schema, request) => {
        const comments = schema.all('post');
        let targetIndex = -1;
        if (request.queryParams.cursor) {
          targetIndex = comments.models.findIndex(
            (v) => v.id === request.queryParams.cursor
          );
        }
        return comments
          .sort((a, b) => parseInt(b.id) - parseInt(a.id))
          .slice(targetIndex + 1, targetIndex + 11); // 최신순 정렬
      });

      this.get('/users/:id', (schema, request) => {
        console.log('request', request.params.id);
        return schema.find('user', request.params.id.slice(1));
      });

      this.get('/users/:id/:type', (schema, request) => {
        console.log('request', request.queryParams);
        let posts = schema.all('post');
        if (request.params.type === 'threads') {
          posts = posts.filter((post) => post.user?.id === request.params.id);
        } else if (request.params.type === 'reposts') {
          posts = posts.filter((post) => post.user?.id !== request.params.id);
        }
        let targetIndex = -1;
        if (request.queryParams.cursor) {
          targetIndex = posts.models.findIndex(
            (v) => v.id === request.queryParams.cursor
          );
        }
        return posts.slice(targetIndex + 1, targetIndex + 11);
      });

      this.post('/login', (schema, request) => {
        const { username, password } = JSON.parse(request.requestBody);

        if (username === 'user0' && password === '1234') {
          return {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            user: {
              id: 'user0',
              name: 'User0',
              description: 'programmer, developer',
              profileImageUrl:
                'https://avatars.githubusercontent.com/u/123456789?v=4',
            },
          };
        } else {
          return new Response(401, {}, { message: 'Invalid credentials' });
        }
      });

      this.get('/search', (schema, request) => {
        const query = request.queryParams.q as string;
        const cursor = parseInt((request.queryParams.cursor as string) || '-1');

        let searchResults = schema.all('search');
        // console.log('searchResults', searchResults.models);

        // 검색 쿼리가 있으면 필터링
        if (query) {
          searchResults = searchResults.filter((item: any) => {
            const name = String(item.name || '').toLowerCase();
            const content = String(item.content || '').toLowerCase();
            const searchTerm = query.toLowerCase();
            return name.includes(searchTerm) || content.includes(searchTerm);
          });
        }

        // 페이지네이션 적용
        const paginatedResults = searchResults.models.slice(
          cursor + 1,
          cursor + 11
        );

        // serializer를 통해 올바른 형태로 반환
        return new Response(200, {}, { results: paginatedResults });
      });

      this.get('/activities', (schema, request) => {
        const type = request.queryParams.type as string;
        const cursor = parseInt((request.queryParams.cursor as string) || '-1');

        let activities = schema.all('activity');
        // console.log('activities', activities);
        // 타입별 필터링
        if (type && type !== 'all') {
          activities = activities.filter((activity: any) => {
            if (type === 'follows') {
              return activity.type === 'followed';
            } else if (type === 'replies') {
              return activity.type === 'reply';
            } else if (type === 'mentions') {
              return activity.type === 'mention';
            } else if (type === 'quotes') {
              return activity.type === 'quote';
            } else if (type === 'verified') {
              return activity.type === 'verified';
            }
            return true;
          });
        }

        return activities.slice(cursor + 1, cursor + 21);
      });
    },
  });
}
