import { SecurityGroup, SecurityGroupEgress, SecurityGroupIngress } from "@cdktf/provider-aws/lib/vpc";
import { Construct } from "constructs";

export interface AwsSecurityGroupConfig {
  readonly ingressList: SecurityGroupIngress[];
  readonly egressList: SecurityGroupEgress[];
}

export class AwsSecurityGroup extends Construct {
  public readonly resource: SecurityGroup;
  constructor(scope: Construct, resourceCode: string, usage: string, vpcId: string, config: AwsSecurityGroupConfig, tags: { [key: string]: string }) {
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
