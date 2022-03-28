import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws";
import { AwsVpc, AwsVpcConfig } from "./constructs/network/aws_vpc";
import { AwsSubnet, AwsSubnetConfig } from "./constructs/network/aws_subnet";
import { AwsRouteTable, AwsRouteTableConfig } from "./constructs/network/aws_route_table";
import { AwsEc2, AwsEc2ConfigCreatingKeyPair } from "./constructs/computing/aws_ec2";
import { TlsProvider } from "@cdktf/provider-tls";
import * as awsSubnetConfigsJson from "./configs/aws_subnet_config.json";
import * as awsBastionConfigJson from "./configs/aws_bastion_config.json";
import * as awsVpcConfigJson from "./configs/aws_vpc_config.json";
import { AwsEip } from "./constructs/computing/aws_eip";

class NetworkStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const defaultTags = {
      Project: "AYLEE",
      Stage: "DEV",
    };

    new AwsProvider(this, "AWS", {
      region: "ap-northeast-2",
      profile: "aylee",
    });

    new TlsProvider(this, "TLS");

    // VPC 생성
    const awsVpcConfig: AwsVpcConfig = JSON.parse(JSON.stringify(awsVpcConfigJson));
    const vpc = new AwsVpc(this, "VPC", awsVpcConfig, defaultTags);

    // Subnet 구성 파일
    const awsSubnetConfigs = JSON.parse(JSON.stringify(awsSubnetConfigsJson));

    // 기본 Public Subnet 생성 (InternetGateway 생성)
    const publicSubnets: AwsSubnet[] = [];
    const publicSubnetsConfig: AwsSubnetConfig[] = awsSubnetConfigs.publicSubnets;
    for (const config of publicSubnetsConfig) {
      const publicSubnet = new AwsSubnet(this, "SBN", config, vpc.resource.id, defaultTags);
      publicSubnets.push(publicSubnet);
      const rtConfig: AwsRouteTableConfig = {
        vpcId: vpc.resource.id,
        usage: config.usage,
        availabilityZone: config.availabilityZone,
        route: [
          {
            gatewayId: vpc.internetGateway.resource.id,
            cidrBlock: "0.0.0.0/0",
          },
        ],
      };
      new AwsRouteTable(this, "RT", publicSubnet.resource.id, rtConfig, defaultTags);
    }

    // 기본 Private Subnet 생성 (public NatGateway 연결)
    const privateSubnets: AwsSubnet[] = [];
    const privateSubnetsConfig: AwsSubnetConfig[] = awsSubnetConfigs.privateSubnets;
    for (const index in privateSubnetsConfig) {
      const privateSubnet = new AwsSubnet(this, "SBN", privateSubnetsConfig[index], vpc.resource.id, defaultTags);
      privateSubnets.push(privateSubnet);
      const rtConfig: AwsRouteTableConfig = {
        vpcId: vpc.resource.id,
        usage: privateSubnetsConfig[index].usage,
        availabilityZone: privateSubnetsConfig[index].availabilityZone,
        // 각 AZ 별로 NatGateway가 있으면 각각 연결
        // NatGateway가 이중화 되어 있지 않다면 0번 NatGateway (A존)에 연결
        route: [
          {
            natGatewayId: publicSubnets[index].awsNatGateways[0]
              ? publicSubnets[index].awsNatGateways[0].resource.id
              : publicSubnets[0].awsNatGateways[0].resource.id,
            cidrBlock: "0.0.0.0/0",
          },
        ],
      };
      new AwsRouteTable(this, "RT", privateSubnet.resource.id, rtConfig, defaultTags);
    }

    // 추가 Subnet 생성
    const additionalSubnets: AwsSubnet[] = [];
    const additionalSubnetsConfig: AwsSubnetConfig[] = awsSubnetConfigs.additionalSubnets;
    for (const config of additionalSubnetsConfig) {
      additionalSubnets.push(new AwsSubnet(this, "SBN", config, vpc.resource.id, defaultTags));
    }

    const awsBastionConfig: AwsEc2ConfigCreatingKeyPair = JSON.parse(JSON.stringify(awsBastionConfigJson));

    // Bastion 생성
    const bastion = new AwsEc2(this, "EC2", vpc.resource.id, publicSubnets[0].resource.id, awsBastionConfig, defaultTags);

    // Bastion에 퍼블릭IP 할당
    new AwsEip(this, "EIP", `EC2-${awsBastionConfig.usage}`,defaultTags, bastion.resource.id);
  }
}

const app = new App();
new NetworkStack(app, "AWS-NETWORK");
app.synth();
