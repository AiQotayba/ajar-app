- build map page
    - api https://ajar-backend.mystore.social/api/v1/user/listings?map_mode=1&north=35.951890866871395&south=35.91019110426553&east=36.650467067956924&west=36.61790069192648&zoom=14&max_items=400&radius_px=48&merge_factor=1.1https://ajar-backend.mystore.social/api/v1/user/listings?map_mode=1&north=35.951890866871395&south=35.91019110426553&east=36.650467067956924&west=36.61790069192648&zoom=14&max_items=400&radius_px=48&merge_factor=1.1
    - use Google Maps API to display the map
    - use Google Maps API to display the markers
    - cluster هو مجموعة عقارات اضهر عددها في مكان الخريطة 
        - اذا ضغطنا على cluster يقوم بتحديث الشاشة وفق bbox ويعيد طلب البيانات من الapi
        - bbox هو المستطيل الذي يحدد المنطقة التي يجب عرض العقارات فيها
        - zoom هو مستوى التكبير
        - max_items هو عدد العقارات المطلوب عرضها
        - radius_px هو نصف قطر المنطقة التي يجب عرض العقارات فيها
        - merge_factor هو معامل الدمج
        - map_mode هو نوع الخريطة
        - north هو الطول الشمالي
        - استفيد من تصميم خريطة ("/ar/listings/[id]") لتصميم الخريطة وخذ نفس markers من هناك
```json
{
  "success": true,
  "data": [
    {
      "type": "cluster",
      "cluster_id": "z12-9388x6132",
      "count": 4,
      "lat": 35.9047,
      "lng": 36.61795,
      "expansionZoom": 13,
      "bbox": {
        "north": 35.9255704203956,
        "south": 35.8818240356934,
        "east": 36.6475260742187,
        "west": 36.5932739257813
      },
      "clusterRadiusMeters": 1734,
      "nudgeZoomIfStillCluster": 0
    },
    {
      "type": "cluster",
      "cluster_id": "z12-9389x6129",
      "count": 3,
      "lat": 35.9581333333333,
      "lng": 36.6252,
      "expansionZoom": 13,
      "bbox": {
        "north": 35.9755605731147,
        "south": 35.9389352768359,
        "east": 36.6505260742188,
        "west": 36.5994739257813
      },
      "clusterRadiusMeters": 1732,
      "nudgeZoomIfStillCluster": 0
    }, 
    {
      "type": "ad",
      "id": 2213,
      "lat": 35.9327,
      "lng": 36.6763
    },
    {
      "type": "ad",
      "id": 2912,
      "lat": 35.8914,
      "lng": 36.6306
    },
    {
      "type": "ad",
      "id": 1973,
      "lat": 35.9203,
      "lng": 36.6056
    },
    {
      "type": "ad",
      "id": 1972,
      "lat": 35.8766,
      "lng": 36.6734
    }
  ],
  "meta": {
    "total": 16,
    "zoom": 12,
    "radiusPx": 56,
    "algorithm": "screen"
  },
  "status": 200
}
```