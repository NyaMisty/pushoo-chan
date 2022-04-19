# pushoo-chan

兼容Server酱接口的多通道推送平台

## 功能 Features

- 基于 [pushoo](https://pushoo.js.org/) ，支持企业微信/PushDeer/Bark/Telegram/飞书/钉钉等（具体列表详见pushoo文档）
- 可部署于Cloudflare Workers，也可本机运行
- 多通道并行通知

## 快速开始 Quick Start

- **安装**：Release下载bundle.js，Cloudflare新建Worker，绑定KV变量名`PUSHOO_CONFIG` （详见 #安装部署）

- **配置**：打开部署好的服务，编辑配置文件，使用Ctrl-S保存 （具体配置项详见 #配置）
  - channels部分定义推送通道，name为名称，token、type定义见[pushoo](https://pushoo.js.org/)文档
  - auth部分定义登录用户密码，不需要可删除
  - 样例配置文件：
```
channels:
  # tg channels
  - name: TG
    type: telegram
    token: 1234567:AAAAAAAAAAAAAABBBB#12345678
  # bark channels
  - name: Bark
    type: bark
    token: "https://api.day.app/gp1234567/"

default_channel: TG

auth:
    user: misty
    pass: 123456
```
- **使用**：接口地址：https://XXXX/send
  - 接口与server酱完全兼容，额外支持通道指定参数chan（详见 #使用）
  - 示例：https://XXXX/send?text=111&desp=222&chan=


## 安装部署 Installation

- Cloudflare 手动部署（新手推荐）
  - 下载Release或GitHub Actions的artifact
  - 将bundle.js放入Cloudflare Workers的Quick Edit的编辑器中
  - 新建一个KV Namespace（名称随意），并将其绑定到worker上，variable name为`PUSHOO_CONFIG`
    - 具体操作请Google搜索

- Cloudflare Wrangler自动部署
  - `wrangler login` 配置Cloudflare授权
  - `wrangler kv:namepsace create PUSHOO_CONFIG`
  - 修改wrangler.toml中的`kv_namespaces`为上面命令的输出
  - `wrangler publish`

- NodeJS部署
  - 使用docker目录中的docker-compose.yml启动即可

## 配置 Configuration

- 直接打开首页，在打开的网页中编辑yaml即可，使用 **Ctrl-S** 保存配置的修改
- 配置格式为YAML，可使用注释
  - channels: 【**必填**】 指定各个通道的信息的数组
    - 通道的name为名称
    - token、type定义见[pushoo](https://pushoo.js.org/)文档
  - default_channel：【**必填**】 不指定chan参数时使用的默认推送通道
  - auth：【**可选**】 指定登录用户名密码
    - 使用HTTP Basic认证，仅认证配置编辑界面，**不认证send接口**
    - 密码为*明文存储*，谨慎选择
    - 若不指定则不开启认证

## 使用 Usage

- 接口地址：https://XXXX/send?text=111&desp=222&chan=
- 接口与server酱完全兼容，支持从get、post获取参数text和desp
- 额外支持通道指定参数chan，
  - 单个channel直接填写即可指定
  - 多个channel使用半角逗号分割，可指定多个
  - 可使用`all`同时使用所有的channel推送