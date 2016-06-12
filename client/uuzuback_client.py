#!/usr/bin/env python
# -*- coding: utf-8 -*-

import ConfigParser, commands,time,logging,os,socket,fcntl,struct,json,sys,threading
from redis import Redis
from optparse import OptionParser

import json as j
a={'name':'lust'}
try:
   j.dumps(a)
   json = j
except:
   class json_temp(object):
       def __init__(self):
           pass
       def dumps(self,s):
           return j.write(s)
       def loads(self,s):
           return j.read(s)
   json=json_temp()

cmd = lambda command: commands.getstatusoutput(command)

class Logger:
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


def write_file(file_name,string,mode='a'):
    file = open(file_name,mode)
    file.write(str(string))
    file.close()

def parser_log(log_file):
    info_dict = {}
    try:
        log_info = open(log_file,'r').readlines()
    except:
        info_dict['state'] = False
        info_dict['data'] = 'can not find log file'
        return info_dict
    try:
        state = log_info[0].strip()
        data = [x.strip() for x in log_info[1:]]
    except:
        info_dict['state'] = False
        info_dict['data'] = 'can not parser log'
        return info_dict

    if state == 'ok':
        info_dict['state'] = True
        info_dict['data'] = data
        return info_dict

    elif state == 'wrong':
        info_dict['state'] = False
        info_dict['data'] = data
        return info_dict

    else:
        info_dict['state'] = False
        info_dict['data'] = 'log format illegal'
        return info_dict


def get_conf(sec,key):
    cf = ConfigParser.ConfigParser()
    cf.read(options.configfile)
    return cf.get(sec,key)

def push_to_queue(redis_handle,redis_queue,message):
    try:
        redis_handle.lpush(redis_queue,json.dumps(message))
    except:
        print 'push to redis queue faile'
        infolog.log('push to redis queue faile')

class workThread(threading.Thread):
    def __init__(self,global_conf,instance_conf):
        threading.Thread.__init__(self)
        try:
            #获取全局配置项
            self.message = {}
            self.message['filename'] = None
            self.message['last_all_filename'] = None
            self.message['size'] = 0
            self.message['log'] = None
            self.message['create_time'] = time_stamp
            self.message['success'] = False
            self.message['server_id'] = int(global_conf['server_id'])
            self.message['game_id'] = int(global_conf['game_id'])
            self.message['op_id'] = int(global_conf['op_id'])
            self.redis_queue = global_conf['redis_queue']
            self.message['game_server_ip'] = global_conf['my_ip']
            #获取实例配置项
            self.message['back_type'] = instance_conf['back_type']
            self.message['instance'] = int(instance_conf['instance'])
            self.message['rsync_model'] = instance_conf['rsync_model']
            self.message['last_all_time'] = 0
            self.back_dir = instance_conf['back_dir']
            self.back_log = instance_conf['back_log']
            self.script = instance_conf['script']
            #判断该实例是否区分全备增量
            if instance_conf.has_key('last_all_log'):
                self.last_all_log = instance_conf['last_all_log']
            else:
                self.last_all_log = None

            self.redis_handle = Redis(host=global_conf['redis_host'], port=int(global_conf['redis_port']))

        except:
            print "parser config file faile"
            errorlog.log("parser config file faile")
            sys.exit(4)
        try:
            self.message['interval'] =  int(global_conf['interval'])
        except:
            self.message['interval'] = 3600

    def run(self):
        script_result = cmd(self.script)
        #如果执行备份脚本成功,进行下一步，否则发送脚本执行错误日志到server

        if script_result[0] == 0:
            pass
        else:
            print script_result[1]
            self.message['log'] = 'execute backup script error'
            print self.message
            push_to_queue(self.redis_handle,self.redis_queue,self.message)
            sys.exit(9)

        #解析备份脚本生成的log信息，log记录状态为ok进行下一步，否则发送错误日志到server
        back_info = parser_log(self.back_log)

        if back_info['state']:
            self.message['filename'] = back_info['data'][0]
        else:
            self.message['log'] = back_info['data'][0]
            push_to_queue(self.redis_handle,self.redis_queue,self.message)
            print self.message
            sys.exit(9)

        #判断是否为全备增量的备份类型，是则进行解析上一次全备的log，否则进行下一步
        if self.last_all_log:
            last_back_info = parser_log(self.last_all_log)
            #判断上次全备是否成功，成功则解析全备名称，否则发送错误日志到server
            if last_back_info['state']:
                if self.message['filename'] == last_back_info['data'][0]:
                    try:
                        write_file(self.last_all_log,time_stamp)
                    except:
                        log
                else:
                    self.message['last_all_filename'] = last_back_info['data'][0]
                    self.message['last_all_time'] = int(last_back_info['data'][1])
            else:
                self.message['log'] = 'last all back faile'
                push_to_queue(self.redis_handle,self.redis_queue,self.message)
                print self.message
                sys.exit(9)

        #获取备份文件大小,获取出错则发送错误信息到server
        try:
            self.message['size'] = os.path.getsize(os.path.join(self.back_dir,self.message['filename']))
            self.message['log'] = 'ok'
            self.message['success'] = True
        except:
            self.message['log'] = 'get file size faile'


        push_to_queue(self.redis_handle,self.redis_queue,self.message)

        print self.message
        print 'push ok'

if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option("-c","--config",dest="configfile",action="store",default="/etc/uuzuback.conf",help="special config file")
    parser.add_option("-q","--queue",dest="redis_queue",action="store",default=False,help="special redis queue name,level1 is highlevel")
    (options,args) = parser.parse_args()
    cf = ConfigParser.ConfigParser()
    cf.read(options.configfile)

    time_stamp = int(time.time())
    print get_conf('global','server_id'),time_stamp

    infolog = Logger("infolog",get_conf('global','log'))
    errorlog = Logger("errorlog",get_conf('global','error_log'))
    back_info={}

    secs = cf.sections()
    for sec in secs:
        if sec == 'global':
            global_conf =  dict(cf.items(sec))
            if options.redis_queue:
                global_conf['redis_queue'] = options.redis_queue
        else:
            back_info[sec] = dict(cf.items(sec))

    threads=[]
    for instance,instance_conf in back_info.items():
        threads.append(workThread(global_conf,instance_conf))

    for t in threads:
        t.start()
        time.sleep(2)

    for t in threads:
        t.join()
