import { SecurityGroup, SecurityGroupEgress, SecurityGroupIngress } from "@cdktf/provider-aws/lib/vpc";
import { Construct } from "constructs";

export interface AwsSecurityGroupConfig {
  readonly ingressList: SecurityGroupIngress[];
  readonly egressList: SecurityGroupEgress[];
}

export class AwsSecurityGroup extends Construct {
  public readonly resource: SecurityGroup;
  /**
   * @param scope
   * @param resourceCode - 기본 "SG"
   * @param usage
   * @param vpcId - SG를 생성할 VPC id (vpcId를 지정하지 않고 SG를 생성하면 default VPC에 subnet이 생성됨)
   * @param config
   * @param tags
   */
  constructor(scope: Construct, resourceCode = "SG", usage: string, vpcId: string, config: AwsSecurityGroupConfig, tags: { [key: string]: string }) {
    const sgTags = JSON.parse(JSON.stringify(tags));
    sgTags.Name = `${tags["Project"]}-${tags["Stage"]}-${resourceCode}-${usage}`;
    super(scope, sgTags.Name);

    this.resource = new SecurityGroup(this, sgTags.Name, {
      name: sgTags.Name,
      vpcId,
      ingress: config.ingressList,
      egress: config.egressList,
      tags: sgTags,
    });
  }
}
