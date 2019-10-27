const app = getApp();
Page({
  data: {
    success: false,
    msg: null,
    code: null,
    result: null,
    indicator_dots: false,
    indicator_color: 'rgba(0, 0, 0, .3)',
    indicator_active_color: '#e31c55',
    autoplay: true,
    circular: true,
    data_bottom_line_status: false,
    data_list_loding_status: 1,
    data_list_loding_msg: '',
    params: null,
    result: {
      goodsId: "",
      goodsName: "",
      saleTaxp: 0,
      goodsSpec: 0,
      manufacturer: "",
      beactive: "",
      goodsCode: "",
      shortName: "",
      logogram: "",
      place: "",
      goodsDesc: "",
      treatment: "",
      gcategory: "",
      approvalNo: "",
      approvalTo: "",
      formula: "",
      inEffectDay: 0,
      dayUnit: "",
      storageTerm: "",
      wholLimtNum: 0,
      isEphe: "",
      recipeType: "",
      goodsPurpose: "",
      inventoryNum: 0,
      inventoryNumAndUnit: "",
      unit: ""
    },
    goods_photo: [],
    goods_spec_base_price: 0.0,
    goods_spec_base_original_price: 0.0,
    goods_spec_base_inventory: 0,
    goods_spec_base_images: '',
    goods_specifications_choose: [],
    popup_status: false,
    temp_buy_number: 1,
    buy_event_type: 'buy',
    nav_submit_text: '立即购买',
    nav_submit_is_disabled: true,
    show_field_price_text: null,
    goods_video_is_autoplay: false,
    popup_share_status: false,
  },
  on_error(e) {
    console.log(e)
  },

  onLoad(params) {
    // 启动参数处理
    params = params.goods_id;

    // 参数赋值,初始化
    //params['goods_id']=2;
    this.setData({
      params: params
    });
    this.init();
  },

  onShow() {
    wx.setNavigationBarTitle({
      title: (this.data.result.goodsName == null) ? app.data.common_pages_title.goods_detail : this.data.result.goodsName
    });
  },

  // 获取数据列表
  init() {
    // 数据初始化
    this.setData({
      temp_attribute_active: {}
    });

    // 参数校验
    if ((this.data.params || null) == null) {
      wx.stopPullDownRefresh();
      this.setData({
        data_bottom_line_status: false,
        data_list_loding_status: 2,
        data_list_loding_msg: '商品ID有误',
      });
    } else {
      var self = this;

      // 加载loding
      wx.showLoading({
        title: '加载中...'
      });
      this.setData({
        data_list_loding_status: 1
      });

      wx.request({
        url: "http://122.112.184.150:7002/prairie/goods/getDetail?goodsId=" + this.data.params,
        method: "GET",
        // data: {goods_id: this.data.params.goods_id},
        // dataType: "json",
        // header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: res => {
          wx.stopPullDownRefresh();
          wx.hideLoading();
          console.log("===data===" + JSON.stringify(res.data));

          if (res.data.success == true) {

            var photos = [];
            if (res.data.result.pic_1 != null) {
              photos[0] = res.data.result.pic_1;
            }
            if (res.data.result.pic_2 != null) {
              photos[1] = res.data.result.pic_2;
            }
            if (res.data.result.pic_3 != null) {
              photos[2] = res.data.result.pic_3;
            }
            if (res.data.result.pic_3 != null) {
              photos[3] = res.data.result.pic_4;
            }

            var beactive = "";
            if (res.data.result.beactive == "N") {
              beactive = "是";
            } else {
              beactive = "否";
            }

            var inEffectDay = res.data.result.inEffectDay + res.data.result.dayUnit;
            var isEphe = "";
            if (res.data.result.isEphe == "Y") {
              isEphe = "是";
            } else {
              isEphe = "否";
            }

            var inventoryNumAndUnit = res.data.result.inventoryNum + res.data.result.unit;

            self.setData({
              result: {
                goodsId: res.data.result.goodsId.replace(/^\s*|\s*$/g, ""),
                goodsName: res.data.result.goodsName.replace(/^\s*|\s*$/g, ""),
                saleTaxp: res.data.result.saleTaxp,
                goodsSpec: res.data.result.goodsSpec.replace(/^\s*|\s*$/g, ""),
                manufacturer: res.data.result.manufacturer.replace(/^\s*|\s*$/g, ""),
                beactive: beactive.replace(/^\s*|\s*$/g, ""),
                goodsCode: res.data.result.goodsCode.replace(/^\s*|\s*$/g, ""),
                shortName: res.data.result.shortName.replace(/^\s*|\s*$/g, ""),
                logogram: res.data.result.logogram.replace(/^\s*|\s*$/g, ""),
                goodsSpec: res.data.result.goodsSpec.replace(/^\s*|\s*$/g, ""),
                place: res.data.result.place.replace(/^\s*|\s*$/g, ""),
                goodsDesc: res.data.result.goodsDesc.replace(/^\s*|\s*$/g, ""),
                treatment: res.data.result.treatment.replace(/^\s*|\s*$/g, ""),
                gcategory: res.data.result.gcategory.replace(/^\s*|\s*$/g, ""),
                approvalNo: res.data.result.approvalNo.replace(/^\s*|\s*$/g, "") + "  " + res.data.result.approvalTo.replace(/^\s*|\s*$/g, ""),
                formula: res.data.result.formula.replace(/^\s*|\s*$/g, ""),
                inEffectDay: inEffectDay.replace(/^\s*|\s*$/g, ""),
                storageTerm: res.data.result.storageTerm.replace(/^\s*|\s*$/g, ""),
                wholLimtNum: res.data.result.wholLimtNum,
                isEphe: isEphe.replace(/^\s*|\s*$/g, ""),
                recipeType: res.data.result.recipeType.replace(/^\s*|\s*$/g, ""),
                goodsPurpose: res.data.result.goodsPurpose.replace(/^\s*|\s*$/g, ""),
                inventoryNum: res.data.result.inventoryNum,
                unit: res.data.result.unit.replace(/^\s*|\s*$/g, ""),
                inventoryNumAndUnit: inventoryNumAndUnit
              },
              indicator_dots: (photos.length > 1),
              autoplay: (photos.length > 1),
              goods_photo: photos,
              goods_specifications_choose: res.data.result.goodsSpec || [],
              data_bottom_line_status: true,
              data_list_loding_status: 3,
              nav_submit_is_disabled: (res.data.result.inventoryNum > 0 && res.data.result.beactive == "Y") ? false : true,
              goods_spec_base_price: res.data.result.SaleTaxP,
              goods_spec_base_original_price: res.data.result.a_SaleP,
              goods_spec_base_inventory: res.data.result.inventoryNum,
              goods_spec_base_images: res.data.result.picUrls,
              // show_field_price_text: (data.goods.show_field_price_text == '销售价') ? null : (data.goods.show_field_price_text.replace(/<[^>]+>/g, "") || null),
            });
            // 标题
            wx.setNavigationBarTitle({
              title: res.data.result.goodsName
            });


            // 不能选择规格处理
            this.goods_specifications_choose_handle_dont(0);

            if (res.data.result.inventoryNum <= 0) {
              this.setData({
                nav_submit_text: '商品卖光了',
                nav_submit_is_disabled: true,
              });
            }
          } else if (res.data.result.beactive == "N") {
            this.setData({
              nav_submit_text: '商品已下架',
              nav_submit_is_disabled: true,
            });
          } else {
            self.setData({
              data_bottom_line_status: false,
              data_list_loding_status: 0,
              data_list_loding_msg: res.data.msg,
            });
          }
        },
        fail: () => {
          wx.stopPullDownRefresh();
          wx.hideLoading();
          self.setData({
            data_bottom_line_status: false,
            data_list_loding_status: 2,
            data_list_loding_msg: '服务器请求出错',
          });

          app.showToast("服务器请求出错");
        }
      });
    }
  },

  // 不能选择规格处理
  goods_specifications_choose_handle_dont(key) {
    var temp_data = this.data.result.goodsSpec || [];
    if (temp_data.length <= 0) {
      return false;
    }

    // 是否不能选择
    for (var i in temp_data) {
      for (var k in temp_data[i]['value']) {
        if (i > key) {
          temp_data[i]['value'][k]['is_dont'] = 'spec-dont-choose',
            temp_data[i]['value'][k]['is_disabled'] = '';
          temp_data[i]['value'][k]['is_active'] = '';
        }

        // 当只有一个规格的时候
        if (key == 0 && temp_data.length == 1) {
          temp_data[i]['value'][k]['is_disabled'] = ((temp_data[i]['value'][k]['is_only_level_one'] || null) != null && (temp_data[i]['value'][k]['inventory'] || 0) <= 0) ? 'spec-items-disabled' : '';
        }
      }
    }
    this.setData({
      goods_specifications_choose: temp_data
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.init();
  },

  // 购买弹层关闭
  popup_close_event(e) {
    this.setData({
      popup_status: false
    });
  },

  // 加入购物车
  cart_submit_event(e) {
    this.setData({
      popup_status: true,
      buy_event_type: 'cart'
    });
  },

  // 立即购买
  buy_submit_event(e) {
    this.setData({
      popup_status: true,
      buy_event_type: 'buy'
    });
  },

  // 加入购物车事件
  goods_cart_event(e) {
    // var user = app.get_user_cache_info(this, 'goods_cart_event');
    // // 用户未绑定用户则转到登录页面
    // if (app.user_is_need_login(user)) {
    //   wx.navigateTo({
    //     url: "/pages/login/login?event_callback=init"
    //   });
    //   return false;
    // } else {
    wx.showLoading({
      title: '处理中...'
    });
    var timestamp = Date.parse(new Date()) + "";
    var businessId = timestamp
    wx.request({
      url: "http://122.112.184.150:7002/prairie/carts/add",
      method: 'POST',
      data: {
        "goodsId": this.data.result.goodsId,
        "num": this.data.temp_buy_number,
        "businessId": "12",
        "mobile": "15155157296"
      },
      dataType: 'json',
      success: (res) => {
        wx.hideLoading();
        console.log("===data===" + JSON.stringify(res.data));
        if (res.data.success == true) {
          this.popup_close_event();
          app.showToast("添加成功", "success");
        } else {
          app.showToast(res.data.msg);
        }
      },
      fail: () => {
        wx.hideLoading();

        app.showToast('服务器请求出错');
      }
    });
    // }
  },

  // 数量输入事件
  goods_buy_number_blur(e) {
    var buy_number = parseInt(e.detail.value) || 1;
    this.goods_buy_number_func(buy_number);
  },

  // 数量操作事件
  goods_buy_number_event(e) {
    var type = parseInt(e.currentTarget.dataset.type) || 0;
    var temp_buy_number = parseInt(this.data.temp_buy_number);
    if (type == 0) {
      var buy_number = temp_buy_number - 1;
    } else {
      var buy_number = temp_buy_number + 1;
    }
    if (buy_number <= 0) {
      buy_number = 1;
    }
    this.goods_buy_number_func(buy_number);
  },

  // 数量处理方法
  goods_buy_number_func(buy_number) {
    var inventory = parseInt(this.data.goods_spec_base_inventory);
    var inventory_unit = this.data.result.unit;

    var buy_max_number = parseInt(this.data.result.wholLimtNum) || 0;
    var inventory = parseInt(this.data.goods_spec_base_inventory);
    var inventory_unit = this.data.result.unit;

    if (buy_max_number > 0 && buy_number > buy_max_number) {
      buy_number = buy_max_number;
      app.showToast('限购' + buy_max_number + inventory_unit);
    }
    if (buy_number > inventory) {
      buy_number = inventory;
      app.showToast('库存数量' + inventory + inventory_unit);
    }
    this.setData({
      temp_buy_number: buy_number
    });
  },

  // 确认
  goods_buy_confirm_event(e) {
    // var user = app.get_user_cache_info(this, 'goods_buy_confirm_event');
    // // 用户未绑定用户则转到登录页面
    // if (app.user_is_need_login(user)) {
    //   wx.navigateTo({
    //     url: "/pages/login/login?event_callback=init"
    //   });
    //   return false;
    // } else {
    // 属性
    // var temp_data = this.data.goods_specifications_choose;
    // var sku_count = temp_data.length;
    // var active_count = 0;
    // var spec = [];
    // if(sku_count > 0)
    // {
    //   for(var i in temp_data)
    //   {
    //     for(var k in temp_data[i]['value'])
    //     {
    //       if((temp_data[i]['value'][k]['is_active'] || null) != null)
    //       {
    //         active_count++;
    //         spec.push({"type": temp_data[i]['name'], "value": temp_data[i]['value'][k]['name']});
    //       }
    //     }
    //   }
    //   if(active_count < sku_count)
    //   {
    //     app.showToast('请选择属性');
    //     return false;
    //   }
    // }

    if (this.data.temp_buy_number <= 0) {
      this.setData({
        temp_buy_number: 1
      });
      app.showToast('数量不能为负');
    } else {
      // 操作类型
      switch (this.data.buy_event_type) {
        case 'buy':
          // 进入订单确认页面
          var jsondata = {};
          var list = [];//创建数组
          this.data.result.saleTaxPrice = this.data.result.saleTaxp;
          this.data.result.num = this.data.temp_buy_number;
          this.data.result.businessId = "12";
          this.data.result.mobile = "15155157296";

          var temp_data_list = this.data.result;
          jsondata.total_price = this.data.result.saleTaxp * this.data.result.num;
         
          list.push(temp_data_list);//添加对象
          jsondata.data = list;
          // 进入订单确认页面
          var data = {
            "buy_type": "cart",
            "data": jsondata
          };

          console.log("===data===" + JSON.stringify(data));
          
          wx.navigateTo({
            url: '/pages/buy/buy?data=' + JSON.stringify(data)
          });
          this.popup_close_event();
          break;

        case 'cart':
          this.goods_cart_event(e);
          break;

        default:
          app.showToast("操作事件类型有误");
      }
    }


    // }
  },

  // 进入店铺
  shop_event(e) {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 详情图片查看
  goods_detail_images_view_event(e) {
    var value = e.currentTarget.dataset.value || null;
    if (value != null) {
      wx.previewImage({
        current: value,
        urls: [value]
      });
    }
  },
  // 商品相册图片查看
  goods_photo_view_event(e) {
    var index = e.currentTarget.dataset.index;
    var all = [];
    for (var i in this.data.goods_photo) {
      all.push("http://" + this.data.goods_photo[i]);
    }
    wx.previewImage({
      current: all[index],
      urls: all
    });
  }
});