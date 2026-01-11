<!-- # new report
 
# POST /api/v1/admin/properties 
 في هاي المشكلة بس ماني عارف حلها مع انه هاي القيم موجودة في قاعدة البيانات
{
  "name": { "ar": "الاسم بالعربية", "en": "الاسم بالانجليزية" }, 
  "description": { "ar": "الوصف بالعربية", "en": "الوصف بالانجليزية" },
  "category_id": 522,
  "icon": "properties/694e45e3d69a4.webp",
  "type": "enum",
  "is_filter": false,
  "options": [
    "q1",
    "a1"
  ]
}

{
  "message": "الحقل type المحدد غير صالح.",
  "errors": {
    "type": [
      "الحقل type المحدد غير صالح."
    ]
  }
} -->
 
# إضافة رابط خارجي قصدي تضمين ماني عارف كيف اعملها 
POST {{base_url}}/general/fetch-media
{ "url": "https://www.youtube.com/watch?v=kVGe4lcA31c&list=WL&index=1" }

انا بحاجة لهاي البيانات 
@override
  Future<void> addExternalMedia(Map<String, dynamic> data) async {
    if (data.isEmpty) return;

    data = {
      'url': data['url'],
      'meta': data['meta'],
      'thumbnail': {
        'href': data['links']['thumbnail'][0]['href'],
        'type': data['links']['thumbnail'][0]['type'],
        'content_length': data['links']['thumbnail'][0]['content_length'],
        'media': data['links']['thumbnail'][0]['media'],
      },
      'html': data['html'],
    };

    media.add(
      MediaItem(
        type: data['meta']['medium'] == 'video' ? 'video' : 'image',
        source: 'iframely',
        iframely: data,
        // previewUrl: preview,
      ),
    );
    update();
  }


هذا كود فلاتر بفيدك
ثم لازم بهاي الطريقة 
```json

"type": "sale",
"pay_every": 1,
"insurance": null,
"availability_status": "available",
"status": "draft",
"properties": null,
"features[]": null,
"media": [
    {
        "type": "image",
        "url": "https://scontent-iad3-1.xx.fbcdn.net/v/t15.5256-10/533908904_1807708066795666_9002475714924217177_n.jpg?stp=cmp9_dst-jpg_s403x403_tt6&_nc_cat=104&ccb=1-7&_nc_sid=35f4bf&_nc_ohc=AsDVEzzQLH8Q7kNvwH4ZFC3&_nc_oc=AdnpsW_TTG9wpSBEBr7ICd-TRpO9jIxYI-4LtcdU-0Ic2F1j64xjJcCmNHQUmCVqPsg&_nc_zt=23&_nc_ht=scontent-iad3-1.xx&_nc_gid=yKpPX6I4W67OTX3cuf7SBA&oh=00_Afe3tftFOUpFPivsgOjsOAvJ7862O8pn1kynrJmw4Scepg&oe=68F2A80E",
        "source": "iframely",
        "iframely": {
            "url": "https://www.facebook.com/watch/?v=1722282598402888",
            "meta": {
                "author": "Drama Kingdom",
                "author_url": "https://www.facebook.com/DramaKG",
                "site": "Facebook",
                "title": "Drama Kingdom",
                "description": "ابو مرزوق بدو يعرف جاره ابو عصام مسكر دكانته بحب يعرف كلشي ههه - باب الحارة عاج",
                "canonical": "https://www.facebook.com/DramaKG/videos/1722282598402888/",
                "medium": "video"
            },
            "links": {
                "player": [
                    {
                        "type": "text/html",
                        "rel": [
                            "ssl",
                            "player",
                            "html5"
                        ],
                        "options": {
                            "_show_text": {
                                "label": "Show author's text caption",
                                "value": false
                            }
                        },
                        "html": "<div id=\"fb-root\"></div>\n<script async=\"1\" defer=\"1\" crossorigin=\"anonymous\" src=\"https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v24.0\"></script><div class=\"fb-video\" data-href=\"https://www.facebook.com/DramaKG/videos/1722282598402888\" data-app-id=\"643563966539128\"><blockquote cite=\"https://www.facebook.com/reel/1722282598402888/\" class=\"fb-xfbml-parse-ignore\"><a href=\"https://www.facebook.com/reel/1722282598402888/\"></a><p>ابو مرزوق بدو يعرف جاره ابو عصام مسكر دكانته بحب يعرف كلشي ههه - باب الحارة عاج</p>Posted by <a href=\"https://www.facebook.com/DramaKG\">Drama Kingdom</a> on Saturday, August 16, 2025</blockquote></div>"
                    }
                ],
                "thumbnail": [
                    {
                        "href": "https://scontent-iad3-1.xx.fbcdn.net/v/t15.5256-10/533908904_1807708066795666_9002475714924217177_n.jpg?stp=cmp9_dst-jpg_s403x403_tt6&_nc_cat=104&ccb=1-7&_nc_sid=35f4bf&_nc_ohc=AsDVEzzQLH8Q7kNvwH4ZFC3&_nc_oc=AdnpsW_TTG9wpSBEBr7ICd-TRpO9jIxYI-4LtcdU-0Ic2F1j64xjJcCmNHQUmCVqPsg&_nc_zt=23&_nc_ht=scontent-iad3-1.xx&_nc_gid=yKpPX6I4W67OTX3cuf7SBA&oh=00_Afe3tftFOUpFPivsgOjsOAvJ7862O8pn1kynrJmw4Scepg&oe=68F2A80E",
                        "type": "image/jpg",
                        "rel": [
                            "thumbnail",
                            "ssl"
                        ],
                        "content_length": 27265,
                        "media": {
                            "width": 403,
                            "height": 302
                        }
                    }
                ],
                "icon": [
                    {
                        "href": "https://static.xx.fbcdn.net/rsrc.php/yB/r/2sFJRNmJ5OP.ico",
                        "rel": [
                            "icon",
                            "ssl"
                        ],
                        "type": "image/icon"
                    }
                ]
            },
            "rel": [
                "player",
                "inline",
                "html5",
                "ssl",
                "hosted"
            ],
            "html": "<div class=\"iframely-embed\"><div class=\"iframely-responsive\" style=\"padding-bottom: 74.938%;\"><a href=\"https://www.facebook.com/DramaKG/videos/1722282598402888/\" data-iframely-url=\"https://cdn.iframe.ly/api/iframe?url=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D1722282598402888&key=3906e9589bd2ee8d96ec9673748849cf\"></a></div></div><script async src=\"https://cdn.iframe.ly/embed.js\" charset=\"utf-8\"></script>",
            "options": {
                "_show_text": {
                    "label": "Show author's text caption",
                    "value": false
                }
            }
        }
    }
]
}
```

ss