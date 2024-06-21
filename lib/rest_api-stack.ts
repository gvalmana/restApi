import {
  Stack,
  StackProps,
  aws_lambda_nodejs,
  aws_apigateway,
  aws_dynamodb,
} from "aws-cdk-lib";
import { Construct } from "constructs";
export class RestApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new aws_apigateway.RestApi(this, "blogPostApi");
    const table = new aws_dynamodb.Table(this, "blogPostTable", {
      tableName: "blogPostTable",
      partitionKey: {
        name: id,
        type: aws_dynamodb.AttributeType.STRING,
      },
    });
    const createBlogPostLambdaName = "createBlogPostHandler";
    const createBlogPostLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      createBlogPostLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: createBlogPostLambdaName,
        functionName: createBlogPostLambdaName,
        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );
    table.grantReadWriteData(createBlogPostLambda);
    const getBlogPostLambdaName = "getBlogPostHandler";
    const getBlogPostLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      getBlogPostLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: getBlogPostLambdaName,
        functionName: getBlogPostLambdaName,
        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );
    table.grantReadData(getBlogPostLambda);
    const blogPostPasth = api.root.addResource("blogpost");
    blogPostPasth.addMethod(
      "POST",
      new aws_apigateway.LambdaIntegration(createBlogPostLambda)
    );
    blogPostPasth.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(getBlogPostLambda)
    );
  }
}
