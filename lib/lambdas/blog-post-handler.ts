import { APIGatewayEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { BlogPost } from "./BlogPost";
import { BlogPostService } from "./BlogPostService";

const TABLE_NAME = process.env.TABLE_NAME!;
const blogPostService = new BlogPostService(TABLE_NAME);

export const createBlogPostHandler = async (event: APIGatewayEvent) => {
  const partialBlogPost = JSON.parse(event.body!) as {
    title: string;
    content: string;
    author: string;
  };

  const id = uuid();
  const createdAt = new Date().toISOString();
  const blogPost: BlogPost = {
    id: id,
    title: partialBlogPost.title,
    content: partialBlogPost.content,
    author: partialBlogPost.author,
    createdAt: createdAt,
  };

  await blogPostService.saveBlogPost(blogPost);

  return {
    statusCode: 201,
    body: JSON.stringify({ success: true, data: blogPost }),
  };
};

export const getBlogPostHandler = async (event: APIGatewayEvent) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data: [] }),
  };
};
