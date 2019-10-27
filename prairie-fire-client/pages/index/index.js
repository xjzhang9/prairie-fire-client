const app = getApp();
Page({
  data: {
    success:false,
    msg: null,
    code: null,
    result: {
      dataList: [],
    },
    load_status: 0,
    data_list_loding_status: 1,
    data_bottom_line_status: false,
    totalNum: 0,
    totalPageNum: 0,
    pageSize: 0,
    pageIndex: 1,
    post_data: {},
    common_app_is_enable_search: 1,
    common_app_is_header_nav_fixed: 0,
    common_app_is_online_service: 0,
  },

  onLoad(params) {
    this.init();
  },
  
  init() {
    // var user = app.get_user_cache_info(this, "init");
    // // 用户未绑定用户则转到登录页面
    // if (app.user_is_need_login(user)) {
    //   wx.redirectTo({
    //     url: "/pages/login/login?event_callback=init"
    //   });
    //   return false;
    // } else {
    // 获取数据
    this.get_data_list(1);
    // }
  },
  
  loadData() {
    this.dataList 
  },

  // 获取数据列表
  get_data_list(is_mandatory) {
    // 分页是否还有数据
    if ((is_mandatory || 0) == 0) {
      if (this.data.data_bottom_line_status == true) {
        return false;
      }
    }

    // 加载loding
    wx.showLoading({ title: "加载中..." });
    this.setData({
      data_list_loding_status: 1
    });

    console.log("===index===" + this.data.pageIndex);

    // 获取数据
    wx.request({
      //url: app.get_request_url("list", "goods"),
      url: "http://youluckydog.top:7002/prairie/goods/list?pageIndex=" + this.data.pageIndex,
      method: "GET",
     // data: post_data,
     // dataType: "json",
    //  header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: res => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        console.log("===data===" + JSON.stringify(res.data));
        this.setData({ load_status: 1 });
      
        if (res.data.success == true) {
          if (res.data.result.totalNum > 0) {
            if (this.data.pageIndex <= 1) {
              var temp_data_list = res.data.result.dataList;
            } else {
              var temp_data_list = this.data.result.dataList;
              var temp_data = res.data.result.dataList;
              for (var i in temp_data) {
                temp_data_list.push(temp_data[i]);
              }
            }
            this.setData({
              result:{
                dataList: temp_data_list,
              },
              totalNum: res.data.result.totalNum,
              pageSize: res.data.result.pageSize,
              totalPageNum: res.data.result.totalPageNum,
              data_list_loding_status: 3,
              pageIndex: res.data.result.pageIndex + 1
            });

            // 是否还有数据
            if (this.data.pageIndex > 1 && this.data.pageIndex > this.data.totalPageNum) {
              this.setData({ data_bottom_line_status: true });
            } else {
              this.setData({ data_bottom_line_status: false });
            }
          } else {
            this.setData({
              data_list_loding_status: 0,
            });
            if (this.data.pageIndex <= 1) {
              this.setData({
                result: {
                  dataList: [],
                },
                data_bottom_line_status: false,
              });
            }
          }
        } else {
          this.setData({
            data_list_loding_status: 0
          });

          app.showToast(res.data.msg);
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.stopPullDownRefresh();

        this.setData({
          data_list_loding_status: 2,
          load_status: 1,
          data_bottom_line_status: true
        });
        app.showToast("服务器请求出错");
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
        pageIndex: 1
    });
    this.get_data_list(1);
  },

  // 搜索事件
  search_input_event(e) {
    var keywords = e.detail.value || null;
    if (keywords == null) {
      app.showToast("请输入搜索关键字");
      return false;
    }

    // 进入搜索页面
    wx.navigateTo({
      url: '/pages/goods-search/goods-search?keywords=' + keywords
    });
  },

    // 滚动加载
   scroll_lower(e) {
      this.get_data_list();
   },
});


