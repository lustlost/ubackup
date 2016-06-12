#!/usr/bin/env python
# -*- coding: utf-8 -*-
from redis import Redis
import time
import requests
import sys

dashboard_url='http://ubackup.xxx.com:5000'

def get_config_value(file,item,key):
    cf = ConfigParser.ConfigParser()
    cf.read(file)
    return cf.get(item,key)

if __name__ == '__main__':
    cluster_id=sys.argv[1]
    config_file = '/etc/uuzuback.conf'
    redis_host=get_config_value(config_file,'global','redis_host')
    redis_port=int(get_config_value(config_file,'global','redis_port'))
    redis_h = Redis(host=redis_host, port=redis_port)
    queue_name = 'uuzuback'
    headers = {'content-type': 'application/json'}
    queue_size=redis_h.llen(queue_name)
    r=requests.patch('%s/api/cluster/'%dashboard_url+cluster_id,data=json.dumps({'queue_size':queue_size}),headers=headers)
    print r.text
