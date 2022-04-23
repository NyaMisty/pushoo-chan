# pushoo-chan

兼容Server酱接口的多通道推送平台

## 功能 Features

- **支持多种通道**：基于 [pushoo](https://pushoo.js.org/) ，支持企业微信/PushDeer/Bark/Telegram/飞书/钉钉等（具体列表详见pushoo文档）
- **部署简便**：可部署于Cloudflare Workers，也可本机运行
- **通知分发**：支持多通道、多分组分发推送通知
- **编码指定**：可在参数、header、body各处指定各类编码，支持各种不符合http标准的编码传递方式，适配更多场景
- **接口灵活**：支持从get、post各处获取传入信息，无需附带Content-Type等头部，自动修复非标准请求，方便命令行使用

## 快速开始 Quick Start

- **快速安装**：Release下载bundle.js，Cloudflare新建Worker，绑定KV变量名`PUSHOO_CONFIG` （详见 #安装部署）

- **快速配置**：打开部署好的服务，编辑配置文件，使用Ctrl-S保存 （具体配置项详见 #配置）
  - 【必填】channels部分定义推送通道，name为名称，token、type定义见[pushoo](https://pushoo.js.org/)文档
  - 【可选】channel_groups部分定义推送通道组，name为名称，use中可以填写通道名称或者其他组名
  - 【必填】default_channel为默认的推送通道，可以是任意一个channel或channel_group的名称
  - 【可选】auth部分定义登录用户密码，不需要可删除
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

channel_groups: # groups of channels
  - name: group1
    use:
      - TG
  - name: group2
    use:
      - group1 # can use other group here
      - Bark

default_channel: group2 # can be channel or channel_group name here

auth:
    user: misty
    pass: 123456
```
- **快速使用**：接口地址： `https://XXXX/send`
  - **接口与server酱完全兼容**，额外支持通道指定参数chan、编码参数charset（详见 #使用）
  - 示例：https://XXXX/send?text=111&desp=222&chan=XXX&charset=YYY
    - `curl -vv https://push.host/send?chan=testchan1,testchan2&text=Hello`

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
  - channels: 【**必填**】 推送通道信息列表
    - 通道的name为名称
    - token、type定义见[pushoo](https://pushoo.js.org/)文档
  - channel_groups: 【**可选**】 推送通道分组列表
    - 通道组的name同样为名称
    - use中可以通过name引用其他的通道或分组
      - 无需担心循环引用，程序自动 处理
  - default_channel：【**必填**】 不指定chan参数时使用的默认推送通道
    - 既可以为一个推送通道，也可以是一个推送组
  - auth：【**可选**】 指定登录用户名密码
    - 使用HTTP Basic认证，仅认证配置编辑界面，**不认证send接口**
    - 密码为*明文存储*，谨慎选择
    - 若不指定则不开启认证

## 使用 Usage

- 接口地址：https://XXXX/send?text=111&desp=222&chan=&charset=
- **接口与server酱完全兼容**，支持从get、post获取参数text和desp
- 传递消息内容：text为标题，desp为内容，两者中有一个不为空即可
- 通道指定参数chan
  - 单个channel/channel_group直接填写即可指定
  - 多个channel/channel_group使用半角逗号分割，可指定多个
- 编码指定：
  - URL请求参数编码：仅能通过url参数charset指定
  - POST数据编码：
    - 通过url参数charset指定
    - 通过HTTP Content-Type header指定
    - 通过json/form POST数据的中的charset字段指定

- 示例：
  - 简单发送通知：
    ```
    curl -vv https://push.host/send?text=Hello
    ```
  - 指定通知通道：
    ```
    curl -vv https://push.host/send?chan=testchan1,testchan2&text=Hello
    ```
  - 指定通知通道（GET/POST均可）：
    ```
    # POST
    curl -vv https://push.host/send --data-urlencode "text=啦啦啦啦"
    # GET
    curl --get -vv https://push.host/send --data-urlencode "text=啦啦啦啦"
    ```
  - Windows下发送GBK编码的中文消息（POST）：
    ```
    # POST
    curl -vv https://push.host/send?charset=gbk --data-urlencode "text=啦啦啦"
    # GET
    curl --get -vv https://push.host/send?charset=gbk --data-urlencode "text=啦啦啦"
    ```
