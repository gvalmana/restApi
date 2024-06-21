#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { RestApiStack } from "../lib/rest_api-stack";

const app = new cdk.App();
const region = "us-east-1";
const account = "955828855997";
new RestApiStack(app, "RestApiStack", {
  env: { account: account, region: region },
});
