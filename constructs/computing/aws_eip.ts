import { Eip } from "@cdktf/provider-aws/lib/ec2";
import { Construct } from "constructs";

export class AwsEip extends Construct {
  public readonly resource: Eip;
  /**
   * @param scope
   * @param resourceCode - NatGateway에 할당할 Eip이기 때문에 기본으로 "NAT-EIP" 사용
   * @param usage - NatGateway의 usage를 받아서 사용
   * @param zone - NatGateway의 AZ 사용
   * @param tags
   */
  constructor(scope: Construct, resourceCode = "EIP", usage: string, zone: string, tags: { [key: string]: string }) {
    const eipTags = JSON.parse(JSON.stringify(tags));
    eipTags.Name = `${tags["Project"]}-${tags["Stage"]}-${resourceCode}-${usage}-${zone}`;
    super(scope, eipTags.Name);

    this.resource = new Eip(this, eipTags.Name, {
      tags: eipTags,
    });
  }
}
