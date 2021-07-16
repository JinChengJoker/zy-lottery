## 简介
基于 Node.js 的用于分析体彩大乐透历史开奖数据的命令行工具。

## 功能
- 一键爬取体彩大乐透所有历史开奖数据到本地
- 自动检测/更新本地历史开奖数据（开发中）
- 自动分析你输入的前、后区号码的历史中奖情况
- 支持导出为 HTML 格式文件（开发中）
- 支持机选功能（开发中）

## 用法

### 环境准备
确保安装 Node.js，建议版本 v14 或以上。
```shell
node -v
```

### 安装
```shell
npm install -g zy-lottery
// 或者
yarn global add zy-lottery
```

### 验证安装成功
```shell
dlt --version
```

### 下载大乐透历史数据
```shell
dlt fetch
```

### 分析前区号码
```shell
dlt run -f '01 02 03 04 05'
```

### 分析前区+后区号码
```shell
dlt run -f '01 02 03 04 05' -e '01 02 03'
```