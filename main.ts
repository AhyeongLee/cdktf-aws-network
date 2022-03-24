import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws";
import { AwsVpc, AwsVpcConfig } from "./constructs/aws_vpc";
import { AwsSubnet } from "./constructs/aws_subnet";
import * as awsSubnetConfigsJson from "./configs/aws_subnet_config.json";

class NetworkStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const defaultTags = {
      Project: "AYLEE",
      Stage: "DEV",
    };
    const awsVpcConfig: AwsVpcConfig = {
      assignGeneratedIpv6CidrBlock: false,
      cidrBlock: "10.1.0.0/16",
      enableDnsHostnames: true,
      enableDnsSupport: true,
      instanceTenancy: "default",
    };

    new AwsProvider(this, "AWS", {
      region: "ap-northeast-2",
      profile: "aylee",
    });

    const vpc = new AwsVpc(this, "VPC", awsVpcConfig, defaultTags);

    const awsSubnetConfigs = JSON.parse(JSON.stringify(awsSubnetConfigsJson));
    const awsSubnets: AwsSubnet[] = [];
    for (const awsSubnetConfig of awsSubnetConfigs) {
      awsSubnets.push(new AwsSubnet(this, "SBN", awsSubnetConfig, vpc.rescource.id, defaultTags));
    }
  }
}

const app = new App();
new NetworkStack(app, "AWS-NETWORK");
app.synth();
