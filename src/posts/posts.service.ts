import { Injectable } from '@nestjs/common';
import { Post } from './post.interface';

@Injectable()
export default class PostsService {
  private posts: Post[] = [
    {
      id: 1,
      title: 'PHP storm',
      content: 'A Jetbrain product ',
    },
    {
      id: 2,
      title: 'Web storm',
      content: 'Another Jetbrain product ',
    },
  ];

  getAllPosts(): Post[] {
    return this.posts;
  }
}
