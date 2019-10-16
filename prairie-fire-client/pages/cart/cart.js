const app = getApp();
Page({
  data: {
    data_list_loding_status: 1,
    data_list_loding_msg: '',
    data_bottom_line_status: false,
    success: false,
    msg: null, 
    code: null,
    result: [],
    swipe_index: null,
    total_price: '0.00',
    is_selected_all: false,
    buy_submit_disabled_status: true,
  },
  onShow() {
    wx.setNavigationBarTitle({ title: app.data.common_pages_title.cart });
    this.init();
  },

  init(e) {
    // var user = app.get_user_cache_info(this, "init");
    // // 用户未绑定用户则转到登录页面
    // var msg = (user == false) ? '授权用户信息' : '绑定手机号码';
    // if (app.user_is_need_login(user)) {
    //   wx.showModal({
    //     title: '温馨提示',
    //     content: msg,
    //     confirmText: '确认',
    //     cancelText: '暂不',
    //     success: (result) => {
    //       if (result.confirm) {
    //         wx.navigateTo({
    //           url: "/pages/login/login?event_callback=init"
    //         });
    //       } else {
    //         this.setData({
    //           data_list_loding_status: 0,
    //           data_bottom_line_status: false,
    //           data_list_loding_msg: '请先' + msg,
    //         });
    //       }
    //     },
    //   });
    // } else {
      this.get_data();
    // }
  },

  // 获取数据
  get_data() {
    this.setData({
      data_list_loding_status: 1,
      total_price: '0.00',
      is_selected_all: false,
      buy_submit_disabled_status: true,
    });

    wx.request({
      url: "http://122.112.184.150:7002/prairie/carts/list?mobile=15155157296",
      method: "GET",
      data: {},
      dataType: "json",
      success: res => {
        wx.stopPullDownRefresh();
        console.log("===data===" + JSON.stringify(res.data));
        if (res.data.success == true) {
          var data = res.data.result;
          if (data.length > 0) {
            for (var i in data) {
              data[i]['right'] = [{ type: 'delete', text: '删除' }];
            }
          }
          this.setData({
            result: data,
            data_list_loding_status: data.length == 0 ? 0 : 3,
            data_bottom_line_status: true,
            data_list_loding_msg: '购物车空空如也',
          });
        } else {
          this.setData({
            data_list_loding_status: 2,
            data_bottom_line_status: false,
            data_list_loding_msg: res.data.msg,
          });
          app.showToast(res.data.msg);
        }
      },
      fail: () => {
        wx.stopPullDownRefresh();
        this.setData({
          data_list_loding_status: 2,
          data_bottom_line_status: false,
          data_list_loding_msg: '服务器请求出错',
        });

        app.showToast("服务器请求出错");
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.init();
  },

  // 数量输入事件
  goods_buy_number_blur(e) {
    var index = e.currentTarget.dataset.index || 0;
    var buy_number = parseInt(e.detail.value) || 1;
    this.goods_buy_number_func(index, buy_number);
  },

  // 数量操作事件
  goods_buy_number_event(e) {
    var index = e.currentTarget.dataset.index || 0;
    var type = parseInt(e.currentTarget.dataset.type) || 0;
    var temp_buy_number = parseInt(this.data.result[index]['num']);
    if (type == 0) {
      var buy_number = temp_buy_number - 1;
    } else {
      var buy_number = temp_buy_number + 1;
    }
    this.goods_buy_number_func(index, buy_number);
  },

  // 数量处理方法
  goods_buy_number_func(index, buy_number) {
    var temp_data_list = this.data.result;
    var buy_min_number = parseInt(temp_data_list[index]['buy_min_number']) || 1;
    var buy_max_number = parseInt(temp_data_list[index]['buy_max_number']) || 0;
    var inventory = parseInt(temp_data_list[index]['inventory']);
    var inventory_unit = temp_data_list[index]['inventory_unit'];
    if (buy_number < buy_min_number) {
      buy_number = buy_min_number;
      if (buy_min_number > 1) {
        app.showToast('起购' + buy_min_number + inventory_unit );
        return false;
      }
    }
    if (buy_max_number > 0 && buy_number > buy_max_number) {
      buy_number = buy_max_number;
      app.showToast('限购' + buy_max_number + inventory_unit );
      return false;
    }
    if (buy_number > inventory) {
      buy_number = inventory;
      app.showToast( '库存数量' + inventory + inventory_unit );
      return false;
    }

    if (temp_data_list[index]['num'] == 1 && buy_number == 1)
    {
      return false;
    }

    // 更新数据库
    wx.request({
      url: "http://122.112.184.150:7002/prairie/carts/update",
      method: "POST",
      data: { "goodsId": temp_data_list[index]['goodsId'], "mobile": temp_data_list[index]['mobile'], "num": buy_number},
      dataType: "json",
      success: res => {
        wx.stopPullDownRefresh();
        if (res.data.success == true) {
          temp_data_list[index]['num'] = buy_number;
          this.setData({ result: temp_data_list });

          // 选择处理
          this.selected_calculate();
        } else {
          app.showToast(res.data.msg);
        }
      },
      fail: () => {
        app.showToast("服务器请求出错");
      }
    });
  },

  // 删除操作事件
  cart_delete_event(e) {
    var index = e.currentTarget.dataset.index;
    var temp_data_list = this.data.result;
    var id = temp_data_list[index]['goodsId'] || null;
    var businessId = temp_data_list[index]['businessId'] || null;
    var mobile = temp_data_list[index]['mobile'] || null;

    if (id !== null && businessId != null  && index != null && mobile != null) {
      wx.showModal({
        title: '温馨提示',
        content: '删除后不可恢复，确定继续吗?',
        confirmText: '确认',
        cancelText: '暂不',
        success: (result) => {
          if (result.confirm) {
            this.cart_delete(id, businessId, index, mobile);
          }
        },
      });
    } else {
      app.showToast("参数有误");
    }
  },

  // 购物车删除
  cart_delete(id, businessId, index, mobile) {
    wx.request({
      url: "http://122.112.184.150:7002/prairie/carts/remove",
      method: 'POST',
      data: { "goodsId": id, "businessId": businessId, "mobile": mobile},
      dataType: 'json',
      success: (res) => {
        if (res.data.success == true) {
          var temp_data_list = this.data.result;
          temp_data_list.splice(index, 1);
          this.setData({
            result: temp_data_list,
            swipe_index: null,
            data_list_loding_status: temp_data_list.length == 0 ? 0 : this.data.data_list_loding_status,
          });

          app.showToast('删除成功', 'success');
        } else {
          app.showToast('删除失败');
        }
      },
      fail: () => {
        app.showToast("服务器请求出错");
      }
    });
  },

  // 选中处理
  selectedt_event(e) {
    var type = e.currentTarget.dataset.type || null;
    if (type != null)
    {
      var temp_data_list = this.data.result;
      var temp_is_selected_all = this.data.is_selected_all;
      switch(type) {
        // 批量操作
        case 'all' :
          temp_is_selected_all = (temp_is_selected_all == true) ? false : true;
          for (var i in temp_data_list) {
            temp_data_list[i]['selected'] = temp_is_selected_all;
          }
          break;

        // 节点操作
        case 'node' :
          var index = e.currentTarget.dataset.index || 0;
          temp_data_list[index]['selected'] = (temp_data_list[index]['selected'] == true) ? false : true;
          break;
      }

      this.setData({
        result: temp_data_list,
        is_selected_all: temp_is_selected_all,
      });

      // 选择处理
      this.selected_calculate();
    }
  },

  // 选中计算
  selected_calculate() {
    var total_price = 0;
    var selected_count = 0;
    var temp_data_list = this.data.result;
   
    for (var i in temp_data_list) {
      if ((temp_data_list[i]['selected'] || false) == true) {
        total_price += temp_data_list[i]['num'] * temp_data_list[i]['saleTaxPrice'];
        selected_count++;
      }
    }
  
    this.setData({
      total_price: total_price.toFixed(2),
      buy_submit_disabled_status: (selected_count <= 0),
      is_selected_all: (selected_count >= temp_data_list.length),
    });
  },

  // 结算
  buy_submit_event(e) {
    var selected_count = 0;
    var temp_data_list = this.data.result;
    var jsondata = {};
    var list = [];//创建数组

    for (var i in temp_data_list) {
      if ((temp_data_list[i]['selected'] || false) == true) {
        selected_count++;
       
        var a1 = {};//创建对象
        a1 = temp_data_list[i];
        list.push(a1);//添加对象
      }
    }

    jsondata.total_price = this.data.total_price;
    jsondata.data = list;

    if (selected_count <= 0) {
      app.showToast("请选择商品");
      return false
    }

    // 进入订单确认页面
    var data = {
      "buy_type": "cart",
      "data": jsondata
    };

    console.log("===data===" + JSON.stringify(data));

    wx.redirectTo({
       url: '/pages/buy/buy?data=' + JSON.stringify(data)
    });
  }

});
