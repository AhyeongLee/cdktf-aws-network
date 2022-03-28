import { ec2 } from "@cdktf/provider-aws";
import { PrivateKey } from "@cdktf/provider-tls";
import { Construct } from "constructs";

export class AwsKeyPair extends Construct {
  public readonly resource: ec2.KeyPair;
  /**
   * @param scope
   * @param keyName
   */
  constructor(scope: Construct, keyName: string) {
    super(scope, keyName);
    // ssh-rsa 키페어 생성
    const rsaKey = new PrivateKey(this, `${keyName}-RSA`, {
      algorithm: "RSA",
      rsaBits: 2048,
    });
    // 앞에서 생성한 키페어의 publicKey를 통해 AWS KeyPair 생성
    this.resource = new ec2.KeyPair(this, keyName, {
      publicKey: rsaKey.publicKeyOpenssh,
      keyName: keyName,
    });

    // ssh-rsa 키페어 중 privateKey를 파일로 저장 (EC2 접속에 사용할 pem 키)
    rsaKey.addOverride("provisioner", [
      {
        "local-exec": {
          command: "echo " + `'${rsaKey.privateKeyPem}'` + " > ./" + `${keyName}` + ".pem",
        },
      },
      {
        "local-exec": {
          command: "rm -f ./" + `${keyName}` + ".pem",
          when: "destroy",
        }
      }
    ]);
  }
}
