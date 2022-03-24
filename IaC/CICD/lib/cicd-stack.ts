import { Stack, StackProps, } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { 
  aws_s3 as s3,
  aws_codebuild as codebuild,
  aws_codedeploy as codedeploy,
  aws_autoscaling as asg,
  aws_ec2 as ec2,
} from 'aws-cdk-lib'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CicdStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      isDefault:true
    })

    const SEDO_asg = new asg.AutoScalingGroup(this, 'ASG', {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage()
    })

    const artifactBucket = new s3.Bucket(this, 'ArtifactBucket')

    const gitHubSource = codebuild.Source.gitHub ({
      owner: 'AndrewC402',
      repo: 'SEDO_Application',
      webhook: true,
      webhookFilters: [
        codebuild.FilterGroup
          .inEventOf(codebuild.EventAction.PUSH)
      ]
    })

    new codebuild.Project(this, 'SEDO', {
      source: gitHubSource,
      artifacts: codebuild.Artifacts.s3({
        bucket: artifactBucket,
        includeBuildId: false,
        packageZip: true,
        path: 'build/latest',
        identifier: 'latest_build'
      })
    })

    const application = new codedeploy.ServerApplication(this, 'SEDO_Application', {
      applicationName: 'SEDO',
    })
    
    const deploymentGroup = new codedeploy.ServerDeploymentGroup(this, 'SEDO_deployment_group', {
      application: application,
      deploymentGroupName: 'SEDO_deployment_group',
      autoScalingGroups: [SEDO_asg],
      installAgent: true
    }
    )
  }
}
