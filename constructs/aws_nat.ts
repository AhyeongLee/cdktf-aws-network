import { NatGateway } from "@cdktf/provider-aws/lib/vpc";
import { Construct } from "constructs";
import { AwsEip } from "./aws_eip";

export interface AwsNatGatewayConfig {
  readonly connectivityType: string;
  readonly usage: string;
}

export class AwsNatGateway extends Construct {
  public readonly resource: NatGateway;

  /**
   * @param scope
   * @param resourceCode - 기본적으로 "NAT"로 설정
   *    NatGateway 이름 예 : AYLEE-DEV-NAT-PRI-A ([Project]-[Stage]-[resourceCode]-[usage]-[zone])
   * @param subnetId - NatGateway를 생성하기 위해서는 Subnet ID가 필수값
   * @param zone
   * @param config
   * @param tags
   */
  constructor(scope: Construct, resourceCode = "NAT", subnetId: string, zone: string, config: AwsNatGatewayConfig, tags: { [key: string]: string }) {
    const usage = config.usage.toUpperCase();
    const natTags = JSON.parse(JSON.stringify(tags));
    natTags.Name = `${tags["Project"]}-${tags["Stage"]}-${resourceCode}-${usage}-${zone}`;
    super(scope, natTags.Name);

    // 연결 유형이 public 이면 EIP 생성 후 할당
    const natGateway = new NatGateway(this, natTags.Name, {
      subnetId,
      connectivityType: config.connectivityType,
      allocationId: config.connectivityType === "public" ? new AwsEip(this, "NAT-EIP", usage, zone, tags).resource.allocationId : undefined,
      tags: natTags,
    });
    this.resource = natGateway;
  }
}
