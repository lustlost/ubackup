# UBackup 游族统一异地备份系统

## 简介

此系统解决游族2w+个数据库实例（包括mysql,redis,ssdb）的异地灾备

每天大概40w+个备份文件（99%的数据库实例进行每小时备份策略）

每天40TB+数据量进行异地传输

### 支持任意备份
- 此系统只负责备份异地传输，不负责如何备份
具体备份脚本用户自行编写，只要按照要求把备份信息写入对应日志文件即可



### 支持以下报警类型

- 正常备份脚本出错(脚本退出码非0)
- 超过规定时间未备份
- 非法备份

### 支持后端集群线性扩展

- 集群支持拉取数据调整，权重调整，集群容量可以通过简单的增加节点进行增加
- 节点根据配置预留空间，超过预留空间自动暂停，暂停后只要集群中还尚有正常工作的节点，整个集群就能继续工作

### 支持多纬度数据分析
- 元数据存储在ES，根据需要进行数据分析

### 一键恢复
- 配合恢复脚本可以实现查询备份位置，下载，恢复一气呵成

## 架构介绍

### 架构图
![架构图](https://cloud.githubusercontent.com/assets/3296743/15817881/c18875f2-2c0c-11e6-8258-a3c2caf7cc24.png)

### 统计数据页面
![static1](https://cloud.githubusercontent.com/assets/3296743/15818212/974bf8c0-2c0e-11e6-90f2-216eb0db25e8.png)
![static2](https://cloud.githubusercontent.com/assets/3296743/15818211/974a3634-2c0e-11e6-9d14-983b3e5aa6ae.png)

### 报警页面
![alert](https://cloud.githubusercontent.com/assets/3296743/15818208/973ef350-2c0e-11e6-8c4c-bbfe6aca3447.png)

### 集群管理页面
![alert](https://cloud.githubusercontent.com/assets/3296743/15818209/9743a77e-2c0e-11e6-9296-6785873788d8.png)
