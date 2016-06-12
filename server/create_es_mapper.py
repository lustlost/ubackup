import requests
import json
es_url='http://127.0.0.1:9200'
a = {'mappings': {'table': {
                    'properties': {
                                    'game_id': {'type': 'integer'},
                                    'ip': {'type': 'string', 'index': 'not_analyzed'},
                                    'idc': {'type': 'string', 'index': 'not_analyzed'},
                                    'cabinet_number':{'type': 'string', 'index': 'not_analyzed'},
                                    'cpu_core':{'type': 'integer'},
                                    'sn':{'type': 'string', 'index': 'not_analyzed'},
                                    'memory':{'type': 'integer'},
                                    'disk':{'type': 'integer'},
                                    'type':{'type': 'string', 'index': 'not_analyzed'},
                                    'uuid':{'type': 'string', 'index': 'not_analyzed'},
                                    'date':{'type': 'date'},
                                    'game_name': {'type': 'string', 'index': 'not_analyzed'},

                    }
                    }
                }
}
r=requests.put('%s/cmdb_statistics/'%es_url,data=json.dumps(a))
print r.text
