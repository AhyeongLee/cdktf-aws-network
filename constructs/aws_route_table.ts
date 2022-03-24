import { RouteTable, RouteTableAssociation, RouteTableRoute } from "@cdktf/provider-aws/lib/vpc";
import { Construct } from "constructs";

export interface AwsRouteTableConfig {
  readonly usage: string;
  readonly route: RouteTableRoute[];
  readonly vpcId: string;
  readonly availabilityZone: string;
}

export class AwsRouteTable extends Construct {
  public readonly resource: RouteTable;
  constructor(scope: Construct, resourceCode = "RT", subnetId: string, config: AwsRouteTableConfig, tags: { [key: string]: string }) {
    const zone: string = config.availabilityZone.substr(-1).toUpperCase();
    const rtTags = JSON.parse(JSON.stringify(tags));
    rtTags.Name = `${tags["Project"]}-${tags["Stage"]}-${resourceCode}-${config.usage}-${zone}`;
    super(scope, rtTags.Name);

    this.resource = new RouteTable(this, rtTags.Name, {
      route: config.route,
      vpcId: config.vpcId,
      tags: rtTags,
    });
    new RouteTableAssociation(this, `${rtTags.Name}-ASS`, {
      routeTableId: this.resource.id,
      subnetId,
    });
  }
}
