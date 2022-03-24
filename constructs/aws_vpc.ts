import { Vpc } from "@cdktf/provider-aws/lib/vpc";
import { Construct } from "constructs";
import { AwsInternetGateway } from "./aws_igw";

export interface AwsVpcConfig {
  readonly assignGeneratedIpv6CidrBlock: boolean;
  readonly cidrBlock: string;
  readonly enableDnsHostnames: boolean;
  readonly enableDnsSupport: boolean;
  readonly instanceTenancy: "default" | "dedicated";
}

export class AwsVpc extends Construct {
  public readonly resource: Vpc;
  public readonly internetGateway: AwsInternetGateway;
  /**
   * @param scope
   * @param resourceCode - 기본적으로 "VPC"로 설정
   *  VPC 이름 예 : AYLEE-DEV-VPC ([Project]-[Stage]-[resourceCode])
   * @param config
   * @param tags
   */
  constructor(scope: Construct, resourceCode = "VPC", config: AwsVpcConfig, tags: { [key: string]: string }) {
    const vpcTags = JSON.parse(JSON.stringify(tags));
    vpcTags.Name = `${tags["Project"]}-${tags["Stage"]}-${resourceCode}`;
    super(scope, vpcTags.Name);

    const vpc = new Vpc(this, vpcTags.Name, {
      assignGeneratedIpv6CidrBlock: config.assignGeneratedIpv6CidrBlock,
      cidrBlock: config.cidrBlock,
      enableDnsHostnames: config.enableDnsHostnames,
      enableDnsSupport: config.enableDnsSupport,
      instanceTenancy: config.instanceTenancy,
      tags: vpcTags,
    });
    this.resource = vpc;
    this.internetGateway = new AwsInternetGateway(this, "IGW", this.resource.id, tags);
  }
}
