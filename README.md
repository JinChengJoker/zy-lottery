## 简介
基于 NodeJs 的用于分析体彩大乐透历史开奖数据的命令行工具。

## 用法

### 安装
```shell
npm install -g zy-lottery
// 或者
yarn global add zy-lottery
```

### 分析前区号码
```shell
dlt -f '01 02 03 04 05'
```

### 分析前区+后区号码
```shell
dlt -f '01 02 03 04 05' -e '01 02 03'
```