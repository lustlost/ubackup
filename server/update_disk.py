#coding:utf8
from optparse import OptionParser
import os,urllib,sys,time,hashlib,json,ConfigParser
import requests

def get_config_value(file,item,key):
    cf = ConfigParser.ConfigParser()
    cf.read(file)
    return cf.get(item,key)


def getDiskInfo(mount_point):
    disk = os.statvfs(mount_point)
    GB = 1024*1024*1024
    rt = {}
    rt['total_size'] = disk.f_bsize * disk.f_blocks / GB
    rt['use_size'] = rt['total_size'] - disk.f_bsize * disk.f_bfree / GB
    return rt

if __name__ == '__main__':
    config_file = '/etc/uuzuback.conf'
    backup_path=get_config_value(config_file,'global','server_root_path')
    node_id=get_config_value(config_file,'global','node_id')
    size,used = getDiskInfo(backup_path).values()
    data={'size':size,'used':used}
    headers = {'content-type': 'application/json'}
    r=requests.patch('http://ubackup.youzu.com/api/node/'+node_id,data=json.dumps(data),headers=headers)
    print r.text
