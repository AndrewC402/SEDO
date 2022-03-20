import { Stack, StackProps } from 'aws-cdk-lib';
import * as cdk from '@aws-cdk/core'
import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CicdStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const gitHubSource = codebuild.Source.gitHub ({
      owner: 'AndrewC402',
      repo: 'SEDO',
      webhook: true,
      webhookFilters: [
        codebuild.FilterGroup
          .inEventOf(codebuild.EventAction.PUSH)
      ]
    })

    new codebuild.Project(this, 'SEDO', {
      source: gitHubSource
    })
  }
}
