const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');

console.log(Dysmsapi20170525);
const getClient = (() => {
  let client = null;

  return () => {
    if (client === null) {
      if (!process.env.GANTE_SMS_accessKeyId || !process.env.GANTE_SMS_accessKeySecret) {
        throw new Error('缺少SMS环境变量配置');
      }

      let config = new OpenApi.Config({
        // 必填，您的 AccessKey ID
        accessKeyId: process.env.GANTE_SMS_accessKeyId,
        // 必填，您的 AccessKey Secret
        accessKeySecret: process.env.GANTE_SMS_accessKeySecret,
      });
      // 访问的域名
      config.endpoint = `dysmsapi.aliyuncs.com`;
      client = new Dysmsapi20170525.default(config);
    }
    return client;
  };
})();


const sendCaptchaSms = async ({
  phone,
  number
}) => {
  const client = getClient();
  let sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
    phoneNumbers: phone,
    signName: "gante甘特图",
    templateCode: "SMS_270865308",
    templateParam: `{"code":"${number}"}`,
  });
  let runtime = new Util.RuntimeOptions({ });
  console.log(await client.sendSmsWithOptions(sendSmsRequest, runtime));
};

module.exports = {
  sendCaptchaSms
}
