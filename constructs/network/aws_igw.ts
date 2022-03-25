import { InternetGateway } from "@cdktf/provider-aws/lib/vpc";
import { Construct } from "constructs";

export class AwsInternetGateway extends Construct {
  public readonly resource: InternetGateway;
  /**
   * @param scope
   * @param resourceCode - 기본적으로 "IGW"로 설정
   * @param vpcId - IGW가 생성될 VPC ID
   * @param tags
   */
  constructor(scope: Construct, resourceCode = "IGW", vpcId: string, tags: { [key: string]: string }) {
    const igwTags = JSON.parse(JSON.stringify(tags));
    igwTags.Name = `${tags["Project"]}-${tags["Stage"]}-${resourceCode}`;
    super(scope, igwTags.Name);

    this.resource = new InternetGateway(this, igwTags.Name, {
      vpcId,
      tags: igwTags,
    });
  }
}
