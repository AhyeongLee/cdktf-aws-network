import { ec2 } from "@cdktf/provider-aws";
import { PrivateKey } from "@cdktf/provider-tls";
import { Construct } from "constructs";

export class AwsKeyPair extends Construct {
  public readonly resource: ec2.KeyPair;
  constructor(scope: Construct, keyName: string) {
    super(scope, keyName);
    const rsaKey = new PrivateKey(this, `${keyName}-RSA`, {
      algorithm: "RSA",
      rsaBits: 2048,
    });
    this.resource = new ec2.KeyPair(this, keyName, {
      publicKey: rsaKey.publicKeyOpenssh,
      keyName: keyName,
    });

    rsaKey.addOverride("provisioner", [
      {
        "local-exec": {
          command: "echo " + `'${rsaKey.privateKeyPem}'` + " > ./" + `${keyName}` + ".pem",
        },
      },
    ]);
  }
}
