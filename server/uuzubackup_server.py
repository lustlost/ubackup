#!/usr/bin/env python
# -*- coding: utf-8 -*-

import ConfigParser,commands,time,logging,os,json,subprocess,threading,sys
from redis import Redis

cmd = lambda command: commands.getstatusoutput(command)

def keep_dir_exsit(dir_name):
    if os.path.exists(dir_name):
        return True
    else:
        infolog.log('create dir %s'%dir_name)
        os.makedirs(dir_name)
        return True

def conf_parsing(conf_file):
    cf = ConfigParser.ConfigParser()
    cf.read(conf_file)
    return cf

class Logger():
    def __init__(self,logName,logFile):
        self.__logger = logging.getLogger(logName)
        handler = logging.FileHandler(logFile)
        formatter = logging.Formatter('%(asctime)s %(message)s','%y-%m-%d %H:%M:%S')
        handler.setFormatter(formatter)
        self.__logger.addHandler(handler)
        self.__logger.setLevel(logging.INFO)

    def log(self,msg):
        if self.__logger is not None:
            self.__logger.info(msg)

def get_conf(key):
    key = key
    config = conf_parsing('/etc/uuzuback.conf')
    return config.get('global',key)


class workThread(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)

        self.server_root_path = get_conf('server_root_path')
        self.rsync_bwlimit = get_conf('rsync_bwlimit')
        self.interval = get_conf('interval')
        self.redis_host = get_conf('redis_host')
        self.redis_port = int(get_conf('redis_port'))
        self.redis_queue = get_conf('redis_queue').split()
        self.back_server_ip = get_conf('myip')
        self.message_redis_host=get_conf('message_redis_host')
        self.message_redis_port=int(get_conf('message_redis_port'))
        self.message_queue=get_conf('message_queue')
        self.retry = int(get_conf('retry'))

    def run(self):
        redis_queue_handle = Redis(host=self.redis_host,port=self.redis_port)
        message_queue_handle = Redis(self.message_redis_host,port=self.message_redis_port)
        back_dir_path = None
        last_sharding_table_name = 'test'
        while True:
            #等待时间,做调整备份速度用
            time.sleep(int(get_conf('interval')))

            #检查磁盘剩余空间大小
            try:
                st = os.statvfs(self.server_root_path)
                free = int((st.f_bavail * st.f_frsize)/1024/1024/1024)
                reserve = int(get_conf('reserve'))
                if free < reserve:
                    errorlog.log('disk is less than %sGB'%reserve)
                    time.sleep(10)
                    continue
            except Exception,e:
                errorlog.log('check free disk failure:%s'%e)

            #从redis队列取出备份消息
            try:
                for queue in self.redis_queue:
                  res = redis_queue_handle.rpop(queue)
                  if res:
                      message = json.loads(res)
                      #print message
                      has_message = 1
                      break
                  else:
                      has_message = 0
                      time.sleep(1)

                if not has_message:continue

            except:
                #print self.redis_queue
                #print "pop from redis queue failure"
                errorlog.log('pop from redis queue failure')
                continue

            try:
                if bool(message['success']):
                    succeed = 1
                else:
                    succeed = 0

                back_type = str(message['back_type'])
                server_id = int(message['server_id'])
                op_id = int(message['op_id'])
                game_id = int(message['game_id'])
                game_server_ip = str(message['game_server_ip'])
                instance = int(message['instance'])
                create_time = int(message['create_time'])
                filename = str(message['filename'])
                size = int(message['size'])
                rsync_model = str(message['rsync_model'])
                last_all_filename = str(message['last_all_filename'])
                last_all_time = int(message['last_all_time'])
                log = str(message['log'])
                rsync_time = int(time.time())
                if 'interval' in message.keys():
                  interval = int(message['interval'])
                else:
                  interval = 3600
            except:
                #print "message illegal: %s"%message
                errorlog.log('message illegal : %s'%message)
                continue

            #根据message中的备份类型和备份文件时间信息生成mysql句柄

            if succeed:
                #根据备份IP生成目录
                try:
                    _tmp = game_server_ip.split('.')
                    remote_net = _tmp[0]+'.'+_tmp[1]+'.'+_tmp[2]
                    back_dir_path = os.path.join(self.server_root_path,back_type,remote_net,_tmp[3])
                    keep_dir_exsit(back_dir_path)
                except:
                    errorlog.log('create path failure')
                    continue

                #调用rsync拉取备份文件
                rsync_cmd = 'rsync --bwlimit=%s -av %s::%s/%s %s'%(self.rsync_bwlimit,
                                                                     message['game_server_ip'],
                                                                     message['rsync_model'],
                                                                     message['filename'],
                                                                     back_dir_path)
                now_retry = 0

                while now_retry < self.retry:
                    infolog.log(rsync_cmd)
                    rsync_return = cmd(rsync_cmd)
                    rsync_time = int(time.time())
                    if rsync_return[0] != 0:
                        now_retry = now_retry + 1
                        #print now_retry
                        #print 'rsync %s error ,retry: %s times,info:%s'%(message['filename'],now_retry,rsync_return[1])
                        errorlog.log('rsync %s error ,retry: %s times,info:%s'%(message['filename'],now_retry,rsync_return[1]))
                        continue
                    else:
                        infolog.log('rsync %s succeeful'%filename)
                        try:
                            #print 'os.path.getsize(os.path.join(%s,%s))'%(back_dir_path,message['filename'])
                            if os.path.getsize(os.path.join(back_dir_path,message['filename'])) != size:
                                log = 'file size not correct'
                                errorlog.log('file size not correct')
                                succeed = 0
                        except Exception,e:
                            errorlog.log('get file size error:%s'%e)
                        break

                else:
                    log = "rsync failure"
                    succeed = 0

            try:
                message={'interval':interval,'server_id':server_id,'game_id':game_id,'op_id':op_id,'game_server_ip':game_server_ip,'instance':instance,'back_server_ip':self.back_server_ip,'file_path':back_dir_path,'filename':filename,'create_time':create_time*1000,'rsync_time':rsync_time*1000,'size':size,'last_all_filename':last_all_filename,'last_all_time':last_all_time*1000,'succeed':succeed,'log':log,'type':back_type}

                message_queue_handle.lpush(self.message_queue,json.dumps(message))
            except Exception,e:
                errorlog.log("store message to queue error :%s"%e)


if __name__ == '__main__':

    infolog = Logger("infolog",get_conf('log'))
    errorlog = Logger("errorlog",get_conf('error_log'))
    work_thread = int(get_conf('work_thread'))

    os.environ["TZ"] = "Asia/Shanghai"
    time.tzset()

    threads=[]

    for x in xrange(work_thread):
        threads.append(workThread())

    for t in threads:
        t.start()

    for t in threads:
        t.join()
