import { Eip } from "@cdktf/provider-aws/lib/ec2";
import { NatGateway } from "@cdktf/provider-aws/lib/vpc";
import { Construct } from "constructs";

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
    const name = `${tags["Project"]}-${tags["Stage"]}-${resourceCode}-${usage}-${zone}`;
    super(scope, name);

    // 연결 유형이 public 이면 EIP 생성 후 할당
    // NatGateway 이름이 AYLEE-DEV-NAT-PRI-A 일 때,
    // Eip 이름은 AYLEE-DEV-EIP-NAT-PRI-A
    const natGateway = new NatGateway(this, name, {
      subnetId,
      connectivityType: config.connectivityType,
      allocationId:
        config.connectivityType === "public" ? new Eip(this, `${tags["Project"]}-${tags["Stage"]}-EIP-${resourceCode}-${zone}`).allocationId : undefined,
    });
    this.resource = natGateway;
  }
}
