import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { BlogPost } from "./BlogPost";
import { BlogPostService } from "./BlogPostService";
import {
  APIGatewayClient,
  GetExportCommand,
} from "@aws-sdk/client-api-gateway";

const TABLE_NAME = process.env.TABLE_NAME!;
const blogPostService = new BlogPostService(TABLE_NAME);
const defatultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};
export const createBlogPostHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
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
    headers: defatultHeaders,
  };
};

export const getBlogPostHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const order = event.queryStringParameters?.order;
  let blogPostList = await blogPostService.getAllBlogPost();
  if (order == "asc") {
    blogPostList = blogPostList.sort((blogPostA, blogPostB) =>
      blogPostA.createdAt.localeCompare(blogPostB.createdAt)
    );
  } else {
    blogPostList = blogPostList.sort((blogPostA, blogPostB) =>
      blogPostB.createdAt.localeCompare(blogPostA.createdAt)
    );
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data: blogPostList }),
    headers: defatultHeaders,
  };
};

export const getOneBlogPostHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const blogPostId = event.pathParameters!.id!;
  const blogPost = await blogPostService.getBlogPostById(blogPostId);
  if (!blogPost) {
    return {
      statusCode: 404,
      body: JSON.stringify({ success: false, message: "Blog post not found" }),
      headers: defatultHeaders,
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data: blogPost }),
    headers: defatultHeaders,
  };
};

export const deleteBlogPostHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const blogPostId = event.pathParameters!.id!;
  await blogPostService.deleteBlogPostById(blogPostId);
  return {
    statusCode: 204,
    body: JSON.stringify({ success: true }),
    headers: defatultHeaders,
  };
};

export const apiDocsHandler = async (event: APIGatewayEvent) => {
  const ui = event.queryStringParameters?.ui;

  const apigateway = new APIGatewayClient({});
  const restApiId = process.env.API_ID!;

  const getExportCommand = new GetExportCommand({
    restApiId: restApiId,
    exportType: "swagger",
    accepts: "application/json",
    stageName: "prod",
  });
  const api = await apigateway.send(getExportCommand);
  const response = Buffer.from(api.body!).toString("utf-8");
  if (!ui) {
    return {
      statusCode: 200,
      body: response,
    };
  }

  const html = `
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="SwaggerUI" />
      <title>SwaggerUI</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: 'api-docs',
          dom_id: '#swagger-ui',
        });
      };
    </script>
    </body>
    </html>
  `;
  return {
    statusCode: 200,
    body: html,
    headers: {
      "Content-Type": "text/html",
    },
  };
};
