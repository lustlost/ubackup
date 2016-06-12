from redis import Redis
import requests
import json
import time
redis_handle = Redis(host='127.0.0.1',port=6381)
redis_handle_ex = Redis(host='127.0.0.1',port=6381,db=9)

def get_game_id_of_name():
  business_url='http://ubackup.uuzu.com:5000/api/business?results_per_page=999999'
  resp=requests.get(business_url).json()['objects']
  game_id_of_name={}
  for r in resp:
    game_id_of_name[r['business_id']]=r['name']
  return game_id_of_name

t=time.time()
game_id_of_name = get_game_id_of_name()
while True:
  try:
    if time.time()-t > 86400:
      try:
        game_id_of_name = get_game_id_of_name()
        t=time.time()
      except:
        t=time.time()
        continue
    message=json.loads(redis_handle.blpop('message')[1])
    if message['game_id'] in game_id_of_name.keys():
      message['game_name'] = game_id_of_name[message['game_id']]
    else:
      message['game_name'] = 'unknow'
    if int(message['rsync_time']) == 0:
      message['rsync_time']=int(time.time())
    r=requests.post("http://127.0.0.1:9200/uuzubackup/table/",data=json.dumps(message))
    key=':'.join([str(message['server_id']),str(message['type']),str(message['instance'])])
    if 'interval' in message.keys():
      interval=int(message['interval']+3000)
      del message['interval']
    else:
      interval=6600
    redis_handle_ex.set(key,0)
    redis_handle_ex.expire(key,interval)
  except Exception,e:
    time.sleep(3)
    print e
