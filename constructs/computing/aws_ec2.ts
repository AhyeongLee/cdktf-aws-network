import { ec2 } from "@cdktf/provider-aws";
import { EipAssociation } from "@cdktf/provider-aws/lib/ec2";
import { Construct } from "constructs";
import { AwsSecurityGroup, AwsSecurityGroupConfig } from "../network/aws_security_group";
import { AwsEip } from "./aws_eip";
import { AwsKeyPair } from "./aws_key_pair";

export interface AwsEc2ConfigCreatingKeyPair {
  craeteKey: boolean;
  usage: string;
  ami: string;
  instanceType: string;
  securityGroupConfig: AwsSecurityGroupConfig;
  associateEip: boolean;
}
export interface AwsEc2ConfigExistingKeyPair {
  keyName: string;
  usage: string;
  ami: string;
  instanceType: string;
  securityGroupConfig: AwsSecurityGroupConfig;
  associateEip: boolean;
}
export type AwsEc2Config = AwsEc2ConfigCreatingKeyPair | AwsEc2ConfigExistingKeyPair;

export class AwsEc2 extends Construct {
  public readonly resource: ec2.Instance;
  /**
   * @param scope
   * @param resourceCode - 기본 "EC2"
   * @param vpcId - SecurityGroup을 생성할 VPC
   * @param subnetId - EC2를 생성할 Subnet
   * @param config
   * @param tags
   */
  constructor(scope: Construct, resourceCode = "EC2", vpcId: string, subnetId: string, config: AwsEc2Config, tags: { [key: string]: string }) {
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

    /**
     * associatePublicIpAddress
     *  associatePublicIpAddress의 값이 변경되면 forces replacement 이기 때문에 기존 EC2 인스턴스가 종료 됨.
     *  associatePublicIpAddress를 false로 설정하고 EIP를 할당하면, 자동으로 associatePublicIpAddress가 true가 되기 때문에
     *  변경사항이 없어도 재배포가 일어나면 associatePublicIpAddress true -> false # forces replacement
     *  따라서 EIP를 할당 예정이라면 associatePublicIpAddress를 true로 설정.
     * 
     * vpcSecurityGroupIds
     *  vpcSecurityGroupIds말고 securityGroups로 하면 forces replacement 됨.
     *  Terraform Docs를 보면 security_groups는 EC2-Classic 또는 default VPC에서만 사용하라고 나와 있음.
     */
    this.resource = new ec2.Instance(this, ec2Tags.Name, {
      keyName,
      ami: config.ami,
      instanceType: config.instanceType,
      subnetId,
      associatePublicIpAddress: (config.associateEip) ? true: false,
      vpcSecurityGroupIds: [
        new AwsSecurityGroup(this, "SG", usage, vpcId, config.securityGroupConfig, tags).resource.id
      ], 
      tags: ec2Tags,
    });

    if (config.associateEip) {
      const eip = new AwsEip(this, "EIP", `${resourceCode}-${usage}`, tags);
      new EipAssociation(this, `EIP-ASS-${resourceCode}-${usage}`, {
        instanceId: this.resource.id,
        allocationId: eip.resource.allocationId,
      });
    }
  }
}
