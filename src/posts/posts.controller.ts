import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import PostsService from './posts.service';

@Controller('posts')
export default class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get()
  public getAllPosts() {
    return this.postService.getAllPosts();
  }
}
