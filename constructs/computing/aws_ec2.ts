import { ec2 } from "@cdktf/provider-aws";
import { Construct } from "constructs";
import { AwsSecurityGroup, AwsSecurityGroupConfig } from "../network/aws_security_group";
import { AwsKeyPair } from "./aws_key_pair";

export interface AwsEc2ConfigCreatingKeyPair {
  craeteKey: boolean;
  usage: string;
  ami: string;
  instanceType: string;
  securityGroupConfig: AwsSecurityGroupConfig;
}
export interface AwsEc2ConfigExistingKeyPair {
  keyName: string;
  usage: string;
  ami: string;
  instanceType: string;
  securityGroupConfig: AwsSecurityGroupConfig;
}
export type AwsEc2Config = AwsEc2ConfigCreatingKeyPair | AwsEc2ConfigExistingKeyPair;

export class AwsEc2 extends Construct {
  public readonly resource: ec2.Instance;
  constructor(scope: Construct, resourceCode: string, vpcId: string, subnetId: string, config: AwsEc2Config, tags: { [key: string]: string }) {
    const usage = config.usage.toUpperCase();
    const ec2Tags = JSON.parse(JSON.stringify(tags));
    ec2Tags.Name = `${tags["Project"]}-${tags["Stage"]}-${resourceCode}-${usage}`;
    super(scope, ec2Tags.Name);

    let keyName: string;
    if ("keyName" in config) {
      keyName = config.keyName;
    } else {
      keyName = new AwsKeyPair(this, `${ec2Tags.Name}-KEY`).resource.keyName;
    }

    const sgId = new AwsSecurityGroup(this, "SG", usage, vpcId, config.securityGroupConfig, tags).resource.id;
    this.resource = new ec2.Instance(this, ec2Tags.Name, {
      keyName,
      ami: config.ami,
      instanceType: config.instanceType,
      subnetId,
      associatePublicIpAddress: false,
      securityGroups: [sgId],
      tags: ec2Tags,
    });
  }
}
