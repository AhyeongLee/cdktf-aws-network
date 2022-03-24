import { InternetGateway, Vpc } from "@cdktf/provider-aws/lib/vpc";
import { Construct } from "constructs";

export interface AwsVpcConfig {
  readonly assignGeneratedIpv6CidrBlock: boolean;
  readonly cidrBlock: string;
  readonly enableDnsHostnames: boolean;
  readonly enableDnsSupport: boolean;
  readonly instanceTenancy: "default" | "dedicated";
}

export class AwsVpc extends Construct {
  public readonly resource: Vpc;
  public readonly internetGateway: InternetGateway;
  /**
   * @param scope
   * @param resourceCode - 기본적으로 "VPC"로 설정
   *  VPC 이름 예 : AYLEE-DEV-VPC ([Project]-[Stage]-[resourceCode])
   * @param config
   * @param tags
   */
  constructor(scope: Construct, resourceCode = "VPC", config: AwsVpcConfig, tags: { [key: string]: string }) {
    const name = `${tags["Project"]}-${tags["Stage"]}-${resourceCode}`;
    super(scope, name);

    const vpc = new Vpc(this, name, config);
    this.resource = vpc;

    this.internetGateway = new InternetGateway(scope, `${tags["Project"]}-${tags["Stage"]}-${resourceCode}-IGW`, {
      vpcId: this.resource.id,
      tags,
    });
  }
}
