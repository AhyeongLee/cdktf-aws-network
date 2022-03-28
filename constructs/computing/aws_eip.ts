import { Eip } from "@cdktf/provider-aws/lib/ec2";
import { Construct } from "constructs";

export class AwsEip extends Construct {
  public readonly resource: Eip;
  /**
   * @param scope
   * @param resourceCode - 기본 "EIP"
   * @param usage 
   * @param tags
   */
  constructor(scope: Construct, resourceCode = "EIP", usage: string, tags: { [key: string]: string }, instanceId?: string) {
    const eipTags = JSON.parse(JSON.stringify(tags));
    eipTags.Name = `${tags["Project"]}-${tags["Stage"]}-${resourceCode}-${usage}`;
    super(scope, eipTags.Name);

    this.resource = new Eip(this, eipTags.Name, {
      tags: eipTags,
      instance: (instanceId) ? instanceId : undefined,
    });
  }
}
