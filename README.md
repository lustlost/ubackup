# UBackup 游族统一异地备份系统

## 简介

此系统解决游族2w+个数据库实例（包括mysql,redis,ssdb）的异地灾备

每天大概40w+个备份文件（99%的数据库实例进行每小时备份策略）

每天40TB+数据量进行异地传输

### 支持任意备份
- 此系统只负责备份异地传输，不负责如何备份
具体备份脚本用户自行编写，只要按照要求把备份信息写入对应日志文件即可
```
备份脚本规范

1.每次都是全备的方式 （例如redis通过RDB每次都是全备）

2.全备+增量 的方式（例如Mysql通过Xtrabackup）
 

脚本日志生成规范：

    备份成功：back_log 第一行为ok，第二行为文件名

    备份失败：back_log 第一行为wrong，第二行为错误信息

 
如果是第2种方式，则在生成back_log的时候，同时生成一份相同的日志信息在last_all_log 日志中
```
- 备份队列优先级控制，重要的备份优先拉取到异地

### 支持以下报警类型
- 正常备份脚本出错(脚本退出码非0)
- 超过规定时间未备份
- 非法备份

针对报警做了一个chrome插件提醒的功能

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

## 部署方式

### 安装基础环境
安装好 ElasticSearch,Redis，下载源码
```
git clone git@github.com:lustlost/ubackup.git
```
初始化ES Mapper
```
python ubackup/server/create_es_mapper.py
```


### 客户端

```
yum install python-redis -y
yum install rsync xinetd -y
sed -i '/disable/ s#yes#no#g' /etc/xinetd.d/rsync
cd ubackup/client
cp uuzuback.conf /etc/

```
确保/etc/rsyncd.conf配置文件包含以下模块（具体可以根据实际情况修改）

```
[backup]
path = /data/backup/
hosts allow = 0.0.0.0/0
read only = yes
```

/etc/init.d/xinetd restart


配置文件有2个样例section
```
[global]
server_id = 111111  #服务器ID，唯一标识，可以用资产编号
game_id = 31  #业务ID，从Dashboard的业务管理中获取
op_id = 1 #保留字段，随便填
interval = 3600 #设定备份间隔时间
redis_host = 0.0.0.0 #服务端redis地址
redis_port = 6379 #服务端redis端口
redis_queue = uuzuback #服务端redis队列名称
my_ip = 127.0.0.0.1 #本机IP
log = /var/log/uuzu_back.log #日志路径
error_log = /var/log/uuzu_back.error #错误日志路径

[mysql3306]   #一个section配置一个需要备份的实例
back_type = mysql  #备份类型
instance = 3306 #实例号，数据库类的备份可以用端口号表示
rsync_model = backup/database_3306 #rsync模块名称
back_dir = /data/backup/database_3306/ #备份文件路径
back_log = /var/log/mysql_3306.log #备份信息路径
last_all_log = /var/log/last_3306.log #上一次全备路径，如果不区分全备增量，此配置可以省略
script = sh /usr/local/uuzuback/mysql_backup.sh /etc/my.cnf #备份脚本

[redis6379]
back_type = redis
instance = 6379
rsync_model = backup/redisbase_6379
back_dir = /data/backup/redisbase_6379/
back_log = /var/log/redis_6379.log
script = sh /usr/local/uuzuback/redis_backup.sh /data/conf/redis_conf
```

把python uuzuback_client.py 加入crontab，cron的间隔时间和配置文件中的interval保持一致


### 服务端:
安装依赖
```
yum install supervisor MySQL-python -y
pip install redis
cd ubackup/server/
cp uuzuback.conf /etc/

```

配置文件
```
[global]
work_thread = 4 #执行rsync拉取的线程数量
rsync_bwlimit = 62000 #rsync带宽限制
server_root_path = /backup/uuzubackup/ #本地备份存放根目录
reserve = 1000 #本机保留大小
interval = 0 #每个线程拉取备份后，休息的秒数，可以用来控制拉取速度的
redis_host = 127.0.0.1 #redis地址
redis_port = 6379 #redis端口
redis_queue = level1 uuzuback_f #队列名称，越前面的优先级越高
log = /var/log/uuzuback.log 
error_log = /var/log/uuzuback.error
myip = 127.0.0.1 #本机IP
retry = 3 #拉取重试次数
message_redis_host=127.0.0.1 #全局队列地址
message_redis_port=6379 #全局队列端口
message_queue=message #全局队列名称
mysqlkeeptime = 15 #保留字段
rediskeeptime = 15 #保留字段
node_id=5 #节点ID，从Dashboard中获取，用于上报节点信息用
```

启动服务
/etc/supervisord.conf 加入配置段，server端执行文件路径根据实际情况配置
打开 to_es.py
修改5-9行的redis,es,dashboard连接信息

```
[program:uuzu_backup_server]
command=/usr/bin/python /usr/local/uuzuback/uuzuback_server.py
autorestart=true
autostart=true
stdout_logfile=/var/log/uuzu_backup_server.log

[program:to_es]
command=/usr/bin/python /usr/local/uuzuback/to_es.py
autorestart=true
autostart=true
stdout_logfile=/var/log/uuzu_backup_to_es.log
```

### Dashboard:
```
cd ubackup/dashboard
pip install -r requirements.txt
```

修改config.py，配置好数据库连接串,执行

```
python -c 'from myapp import db;db.create_all()'
```
启动服务
```
python runserver.py
```
访问5000端口即可

### 节点信息上报:

队列信息上报
```
在redis服务器上
修改 server/update_queue.py中的dashboard_url
添加crontab
python update_queue.py {{ID}} 加入crontab ，ID
配置文件使用任意节点的配置
```
磁盘信息上报
```
在节点服务器上
修改 server/update_disk.py中的dashboard_url
添加corntab
python update_disk.py 加入crontab
配置文件中的node_id配置的ID，配置为Dashboard上的节点ID

```
