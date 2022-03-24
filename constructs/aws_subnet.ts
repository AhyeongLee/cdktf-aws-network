import { Subnet } from "@cdktf/provider-aws/lib/vpc/subnet";
import { Construct } from "constructs";
import { AwsNatGateway, AwsNatGatewayConfig } from "./aws_nat";

export interface AwsSubnetConfig {
  readonly assignIpv6AddressOnCreation: boolean;
  readonly cidrBlock: string;
  readonly mapPublicIpOnLaunch: boolean;
  readonly availabilityZone: string;
  readonly usage: string;
  readonly awsNatGatewayConfigs: AwsNatGatewayConfig[];
}

export class AwsSubnet extends Construct {
  public readonly resource: Subnet;
  public readonly awsNatGateways: AwsNatGateway[];

  /**
   * @param scope
   * @param resourceCode - 기본적으로 "SBN"으로 설정
   *  Subnet 이름 예 : AYLEE-DEV-SBN-PRI-A ([Project]-[Stage]-[resourceCode]-[usage]-[zone])
   * @param config
   * @param vpcId - Subnet을 생성하기 위해서는 VPC ID가 필수값
   * @param tags
   */
  constructor(scope: Construct, resourceCode = "SBN", config: AwsSubnetConfig, vpcId: string, tags: { [key: string]: string }) {
    const zone: string = config.availabilityZone.substr(-1).toUpperCase();
    const usage = config.usage.toUpperCase();
    const name = `${tags["Project"]}-${tags["Stage"]}-${resourceCode}-${usage}-${zone}`;

    super(scope, name);

    const subnet = new Subnet(this, name, {
      assignIpv6AddressOnCreation: config.assignIpv6AddressOnCreation,
      cidrBlock: config.cidrBlock,
      mapPublicIpOnLaunch: config.mapPublicIpOnLaunch,
      availabilityZone: config.availabilityZone,
      vpcId: vpcId,
      tags: tags,
    });
    this.resource = subnet;

    // NatGateway가 필요한 경우 생성
    this.awsNatGateways = [];
    const natConfigs = config.awsNatGatewayConfigs;
    for (const natConfig of natConfigs) {
      this.awsNatGateways.push(new AwsNatGateway(this, "NAT", this.resource.id, zone, natConfig, tags));
    }
  }
}
