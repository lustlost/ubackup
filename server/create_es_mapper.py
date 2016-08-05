import requests
import json
a = {
 'settings':{
      'index':{
          'number_of_shards':3,
          'number_of_replicas':2
      }
  },
 'mappings': {'table': {
                    'properties': {
                                    'server_id': {'type': 'string', 'index': 'not_analyzed'},
                                    'game_id': {'type': 'integer'},
                                    'op_id': {'type': 'integer'},
                                    'game_server_ip': {'type': 'ip'},
                                    'instance': {'type': 'integer'},
                                    'back_server_ip': {'type': 'ip'},
                                    'file_path': {'type': 'string', 'index': 'not_analyzed'},
                                    'type': {'type': 'string', 'index': 'not_analyzed'},
                                    'filename': {'type': 'string', 'index': 'not_analyzed'},
                                    'create_time': {'type': 'date'},
                                    'rsync_time': {'type': 'date'},
                                    'size': {'type': 'long'},
                                    'last_all_filename': {'type': 'string', 'index': 'not_analyzed'},
                                    'last_all_time': {'type': 'date'},
                                    'succeed': {'type': 'integer'},
                                    'log': {'type': 'string', 'index': 'not_analyzed'},
                                    'game_name': {'type': 'string', 'index': 'not_analyzed'}
                    }
                    }
                }
}
r=requests.put('http://127.0.0.1:9200/uuzubackup/',data=json.dumps(a))
print r.text
