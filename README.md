# force-directed-layout

A simple implementation of a force directed layout algorithm using vanilla JavaScript.

The algorithm used the Fruchterman-Reingoldof that implements repulsive and attractive forces between nodes which are connected and those that are not.

The visualization accepts any data in the following format:


```
{
  "nodes": [
    {"id": "1", "group": 1},
    {"id": "2", "group": 1},
    {"id": "3", "group": 1},
    }
   "links": [
    {"id1": "1", "id2": "2"},
    {"id1": "1", "id2": "2"},
    {"id1": "2", "id2": "3"},
     ]
}
```



