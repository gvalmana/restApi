import {
  Stack,
  StackProps,
  aws_lambda_nodejs,
  aws_apigateway,
  aws_dynamodb,
  aws_iam,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { getBlogPostHandler } from "./lambdas/blog-post-handler";
export class RestApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new aws_apigateway.RestApi(this, "blogPostApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: aws_apigateway.Cors.DEFAULT_HEADERS,
      },
    });
    const table = new aws_dynamodb.Table(this, "blogPostTable", {
      tableName: "blogPostTable",
      partitionKey: {
        name: "id",
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

    const getOneBlogPostLambdaName = "getOneBlogPostHandler";
    const getOneBlogPostHandler = new aws_lambda_nodejs.NodejsFunction(
      this,
      getOneBlogPostLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: getOneBlogPostLambdaName,
        functionName: getOneBlogPostLambdaName,
        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );
    table.grantReadData(getOneBlogPostHandler);

    const deleteBlogPostLambdaName = "deleteBlogPostHandler";
    const deleteBlogPostLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      deleteBlogPostLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: deleteBlogPostLambdaName,
        functionName: deleteBlogPostLambdaName,
        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );
    table.grantWriteData(deleteBlogPostLambda);

    const apiDocsLambdaName = "apiDocsHandler";
    const apiDocsLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      apiDocsLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: apiDocsLambdaName,
        functionName: apiDocsLambdaName,
        environment: {
          API_ID: api.restApiId,
        },
      }
    );

    const policy = new aws_iam.PolicyStatement({
      actions: ["apigateway:GET"],
      resources: ["*"],
    });

    apiDocsLambda.role?.addToPrincipalPolicy(policy);

    const apiDocsPath = api.root.addResource("api-docs");
    apiDocsPath.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(apiDocsLambda),
      {
        requestParameters: {
          "method.request.querystring.ui": false,
        },
      }
    );

    const blogPostPasth = api.root.addResource("blogpost");
    blogPostPasth.addMethod(
      "POST",
      new aws_apigateway.LambdaIntegration(createBlogPostLambda)
    );
    blogPostPasth.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(getBlogPostLambda),
      {
        requestParameters: {
          "method.request.querystring.order": false,
        },
      }
    );
    const blogPostByIdPath = blogPostPasth.addResource("{id}");
    blogPostByIdPath.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(getOneBlogPostHandler)
    );
    blogPostByIdPath.addMethod(
      "DELETE",
      new aws_apigateway.LambdaIntegration(deleteBlogPostLambda)
    );
  }
}
