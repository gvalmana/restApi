import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { BlogPost } from "./BlogPost";

export class BlogPostService {
  private tableName: string;
  private dynamoClient: DynamoDBClient;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.dynamoClient = new DynamoDBClient({});
  }

  async saveBlogPost(blogPost: BlogPost): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        ...marshall(blogPost),
      },
    };
    const command = new PutItemCommand(params);
    await this.dynamoClient.send(command);
  }
}
