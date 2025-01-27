var CarMaid = {};

/*
 * Map
 */
(function($) {

	var Map = {
		/*
		 * 获取位置成功后的回掉函数。
		 */
		geoInf: function(position) {
			console.log(JSON.stringify(position));

			var address = position.address; //获取地理坐标信息
			var district = address.district ? address.district : "";
			var city = address.city ? address.city : "";
			var location = "";
			if (district != "") {
				location = district;
			} else if (city != "") {
				location = city;
			} else {
				mui.toast('定位失败');
			}
			location = location != "" ? location : '柳州市';
			console.log(location);

			document.getElementById('Location').innerText = location;

			plus.storage.setItem("position", JSON.stringify(position));

		},
		/*
		 * 获取位置信息 By Baidu
		 */
		getPosByBaidu: function(geoInf) {
			plus.geolocation.getCurrentPosition(geoInf, function(e) {
				mui.toast('获取定位信息失败！')
			}, {
				provider: 'baidu'
			});
		},
		/*
		 * 获取存储在本地的位置信息。
		 */
		getstoragePos: function() {

		}
	};

	$.Map = Map;
})(CarMaid);

/*
 * Banners
 */
(function($, mui) {


	var Banners = {
		/*
		 * retry 为重试的次数
		 */
		initBanners: function(onSuccess, onError, retry) {
			var url = 'http://api.cheshibang.com/api/init/getbanners';
			mui.ajax(url, {
				dataType: 'json',
				type: 'get',
				timeout: 5000,
				success: function(data) {
					console.log('banners ok');
					onSuccess(data);
				},
				error: function(xhr, type, errorThrown) {

					--retry;
					//console.log(retry);
					if (retry > 0) {
						console.log('banners error');
						return Banners.initBanners(onSuccess, onError, retry);
					}

					onError(xhr, type, errorThrown);

				}
			})
		},
		addBanne: function(index, imgUrl, name, duplicate) {
			var div = document.createElement('div');
			console.log(duplicate);
			div.className = duplicate ? 'mui-slider-item mui-slider-item-duplicate' : 'mui-slider-item';
			var a = document.createElement('a');
			a.href = '###';
			a.id = index;
			var img = document.createElement('img');
			img.src = 'http://' + imgUrl;
			a.appendChild(img);
			var p = document.createElement('p');
			p.className = 'mui-slider-title';
			p.innerText = name;
			div.appendChild(a);
			div.appendChild(p);
			return div;
		},
		AddIndicator: function(len) {
			var div = document.createElement('div');
			div.className = 'mui-slider-indicator mui-text-right';
			for (var i = 0; i < len; i++) {
				var d = document.createElement('div');
				d.className = i == 0 ? 'mui-indicator mui-active' : 'mui-indicator';
				div.appendChild(d);
			}
			return div;
		}
	};
	$.Banners = Banners;

})(CarMaid, mui);

/*
 * 车型管理
 */
(function($, mui) {

	var vehicle = {
		GetVehicleBrands: function(onSuccess, onError, retry) {
			var url = 'http://api.cheshibang.com/api/Vehicle/GetVehicleBrands';
			mui.ajax(url, {
				dataType: 'json',
				type: 'get',
				timeout: 5000,
				success: function(data) {
					// 解析 生成为div
					var parentDIV = document.getElementById('list');

					// 搜索 div
					var searchDIV = document.createElement('div');
					searchDIV.className = 'mui-indexed-list-search mui-input-row mui-search';
					var searchInput = document.createElement('input');
					searchInput.type = 'search';
					searchInput.className = 'mui-input-clear mui-indexed-list-search-input';
					searchInput.placeholder = '搜索品牌';
					searchDIV.appendChild(searchInput);

					// 右侧 首字母导航div
					var IndexListDIV = document.createElement('div');
					IndexListDIV.id = 'mui-indexed-list-bar';
					IndexListDIV.className = 'mui-indexed-list-bar';
					for (var i = 0; i < data.length; i++) {
						var a = document.createElement('a');
						a.innerText = data[i].brandIndex;
						//console.log(a.innerText);
						IndexListDIV.appendChild(a);
					}

					var IndexAlertDIV = document.createElement('div');
					IndexAlertDIV.className = 'mui-indexed-list-alert';

					// 主内容
					var IndexInnerDIV = document.createElement('div');
					IndexInnerDIV.className = 'mui-indexed-list-inner';
					//1 emptyAlertDIV
					var emptyAlertDIV = document.createElement('div');
					emptyAlertDIV.className = 'mui-indexed-list-empty-alert';
					emptyAlertDIV.innerHTML = '没有数据';
					//2 ul
					var ul = document.createElement('ul');
					ul.id = 'VehicleBrandList';
					ul.className = 'mui-table-view';
					for (var i = 0; i < data.length; i++) {
						var tmp = data[i];
						var liGroup = document.createElement('li');
						liGroup.setAttribute('data-group', tmp.brandIndex);
						liGroup.className = 'mui-table-view-divider mui-indexed-list-group';
						liGroup.innerText = tmp.brandIndex;
						ul.appendChild(liGroup);

						for (var j = 0; j < tmp.brand.length; j++) {
							var brand = tmp.brand[j];
							//console.log(brand.brandName);
							var item = document.createElement('li');
							item.className = 'mui-table-view-cell mui-indexed-list-item';
							item.id = brand.index;
							item.setAttribute('data-value', brand.index);
							item.setAttribute('data-tags', brand.brandId);
							item.innerText = brand.brandName;

							ul.appendChild(item);
						}
					}
					IndexInnerDIV.appendChild(emptyAlertDIV);
					IndexInnerDIV.appendChild(ul);

					parentDIV.appendChild(searchDIV);
					parentDIV.appendChild(IndexListDIV);
					parentDIV.appendChild(IndexAlertDIV);
					parentDIV.appendChild(IndexInnerDIV);
					// 执行回调函数 初始化 页面
					onSuccess();

				},
				error: function(xhr, type, errorThrown) {
					--retry;
					console.log(retry);
					if (retry > 0) {
						return vehicle.GetVehicleBrands(onSuccess, onError, retry);
					}

					onError();
				}

			});
		},
		GetVehicleSeries: function(VBID, onSuccess, onError, retry) {
			var url = 'http://api.cheshibang.com/api/vehicle/GetVehicleSeries?VBID=' + VBID;
			mui.ajax(url, {
				dataType: 'json',
				type: 'get',
				timeout: 5000,
				success: function(data) {

					// 初始化列表；

					// 改变标题
					var brandName = document.getElementById('brandName');
					brandName.innerText = data.brandName;

					// 左侧 汽车厂家列表；
					var segmentedControls = document.getElementById('segmentedControls');
					segmentedControls.innerHTML = '';
					for (var i = 0; i < data.vehicleSeries.length; i++) {
						var a = document.createElement('a');
						a.className = i == 0 ? 'mui-control-item mui-active' : 'mui-control-item';
						a.href = '#content' + i;
						a.innerText = data.vehicleSeries[i].manufacturerName;
						segmentedControls.appendChild(a);
					}

					// 右侧 车系列表；
					var segmentedControlContents = document.getElementById('segmentedControlContents');
					for (var i = 0; i < data.vehicleSeries.length; i++) {
						// create contentDIV
						var contentDIV = document.createElement('div');
						contentDIV.className = i == 0 ? 'mui-control-content mui-active' : 'mui-control-content';
						contentDIV.id = 'content' + i;
						//create ul
						var ul = document.createElement('ul');
						ul.className = 'mui-table-view';
						// create li
						for (var j = 0; j < data.vehicleSeries[i].vehicleSeries.length; j++) {
							var vsItem = data.vehicleSeries[i].vehicleSeries[j];
							//console.log(vsItem);
							var li = document.createElement('li');
							li.className = 'mui-table-view-cell';
							li.id = vsItem.index;
							li.setAttribute('data-carSreiesId', vsItem.carSreiesId);
							li.innerText = vsItem.carSeries;

							ul.appendChild(li);
						}
						contentDIV.appendChild(ul);
						segmentedControlContents.appendChild(contentDIV);
					}


					onSuccess();
				},
				error: function(xhr, type, errorThrown) {
					--retry;
					console.log(retry);
					if (retry > 0) {
						return vehicle.GetVehicleSeries(VBID, onSuccess, onError, retry);
					}

					onError();
				}
			});
		},
		GetVehicleModel: function(vsid, onSuccess, onError, retry) {
			var url = "http://api.cheshibang.com/api/vehicle/GetVehicleModel?vsid=" + vsid;
			mui.ajax(url, {
				dataType: 'json',
				type: 'get',
				timeout: 5000,
				success: function(data) {
					// 修改 标题
					var seriesName = document.getElementById('seriesName');
					seriesName.innerText = data.seriesName;

					// 左侧 年份 导航列表
					var segmentedControls = document.getElementById('segmentedControls');
					for (var i = 0; i < data.vehicleModel.length; i++) {
						var a = document.createElement('a');
						a.className = i == 0 ? 'mui-control-item mui-active' : 'mui-control-item';
						a.href = '#content' + i;
						a.innerText = data.vehicleModel[i].year;
						segmentedControls.appendChild(a);
					}


					// 右侧 车型数据列表
					var segmentedControlContents = document.getElementById('segmentedControlContents');
					for (var i = 0; i < data.vehicleModel.length; i++) {
						// create contentDIV
						var contentDIV = document.createElement('div');
						contentDIV.className = i == 0 ? 'mui-control-content mui-active' : 'mui-control-content';
						contentDIV.id = 'content' + i;
						//create ul
						var ul = document.createElement('ul');
						ul.className = 'mui-table-view';
						// create li
						for (var j = 0; j < data.vehicleModel[i].model.length; j++) {
							var vsItem = data.vehicleModel[i].model[j];
							//console.log(vsItem);
							var li = document.createElement('li');
							li.className = 'mui-table-view-cell';
							li.id = vsItem.index;
							li.innerText = vsItem.vehicleModelName;
							li.setAttribute('data-imageUrl', vsItem.imageUrl);

							ul.appendChild(li);
						}
						contentDIV.appendChild(ul);
						segmentedControlContents.appendChild(contentDIV);
					}

					onSuccess();
				},
				error: function(xhr, type, errorThrown) {
					--retry;
					console.log(retry);
					if (retry > 0) {
						return vehicle.GetVehicleModel(vsid, onSuccess, onError, retry);
					}
					console.log(xhr.response);
					onError();
				}
			});
		},
		/*
		 * 获取用户的车型
		 */
		InitVehicleModel: function(onSuccess, onError, retry) {
			//http://api.cheshibang.com/api/vehicle/GetUserVehicleModel
			// 将 storage 中的车型 添加到 到用户的车型中去。
			var vm = JSON.parse(plus.storage.getItem('VehicleModel'));
			console.log('vm:' + vm);
			if (vm) {
				vehicle.EditVehicleModel(vm.vmIndex, vm.mileage, vm.buyVehicleDate, function() {
					vehicle._InitVehicleModel(onSuccess, onError, retry);

				}, function() {
					onError();
				}, 0);
			}else{
				vehicle._InitVehicleModel(onSuccess, onError, retry);
			}

		},
		_InitVehicleModel: function(onSuccess, onError, retry) {
			var url = 'http://api.cheshibang.com/api/vehicle/GetUserVehicleModel';
			mui.ajax(url, {
				dataType: 'json',
				type: 'get',
				timeout: 5000,
				success: function(data) {
					console.log(JSON.stringify(data));
					var parentDIV = document.getElementById('VehileModelCollection');

					for (var i = 0; i < data.length; i++) {
						var div = document.createElement('div');
						div.className = 'mui-table-view-cell ';
						div.id = data[i].index;

						// 删除。 编辑
						var sliderDIV = document.createElement('div');
						sliderDIV.className = 'mui-slider-right mui-disabled';
						// 编辑
						var compose = document.createElement('a');
						compose.className = 'mui-btn mui-btn-yellow mui-icon mui-icon-compose';
						compose.setAttribute('data-id', data[i].index);
						compose.setAttribute('data-vmid', data[i].vmIndex);
						// 删除
						var trash = document.createElement('a');
						trash.className = 'mui-btn mui-btn-red mui-icon mui-icon-trash';
						trash.setAttribute('data-id', data[i].index);
						sliderDIV.appendChild(compose);
						sliderDIV.appendChild(trash);

						var sliderHandleDIV = document.createElement('div');
						sliderHandleDIV.className = 'mui-slider-handle mui-radio';
						sliderHandleDIV.id = 'Handle_' + data[i].vmIndex;
						sliderHandleDIV.setAttribute('data-vmid', data[i].vmIndex);
						sliderHandleDIV.setAttribute('data-mileage', data[i].mileage);
						sliderHandleDIV.setAttribute('data-buyVehicleDate', data[i].buyVehicleDate);
						var img = document.createElement('img');
						img.className = 'mui-media-object mui-pull-left';
						img.style.width = 42;
						img.style.height = 42;
						img.src = data[i].imageUrl;
						console.log(data[i].imageUrl);
						var bodyDIV = document.createElement('div');
						bodyDIV.className = 'mui-media-body mui-ellipsis';
						bodyDIV.innerText = data[i].vehicleName;
						var bodyP = document.createElement('p');
						bodyP.id = 'bodyP_' + data[i].vmIndex;
						bodyP.className = 'mui-ellipsis';
						bodyP.innerText = data[i].mileageAndBuyVehicleDate == '' ? "车辆信息尚未完善" : data[i].mileageAndBuyVehicleDate;
						bodyDIV.appendChild(bodyP);
						var input = document.createElement('input');
						input.name = 'radio1';
						input.type = 'radio';
						//input.disabled = true;
						input.checked = data[i].isDefault;
						sliderHandleDIV.appendChild(img);
						sliderHandleDIV.appendChild(bodyDIV);
						sliderHandleDIV.appendChild(input);

						div.appendChild(sliderDIV);
						div.appendChild(sliderHandleDIV);

						parentDIV.appendChild(div);

					}

					onSuccess();
					console.log('success');
				},
				error: function(xhr, type, errorThrown) {
					--retry;
					console.log(retry);
					if (retry > 0) {
						return vehicle.InitVehicleModel(onSuccess, onError, retry);
					}
					console.log(xhr.response);
					onError(xhr, type, errorThrown);
				}
			})
		},
		AddVehicleModel: function(vmid, onSuccess, onError, retry) {

			var url = 'http://api.cheshibang.com/api/vehicle/AddVehicleModel?VMID=' + vmid + '&IsDefault=' + false;

			mui.ajax(url, {
				dataType: 'json',
				type: 'post',
				timeout: 5000,
				success: function(data) {

					onSuccess(data);
				},
				error: function(xhr, type, errorThrown) {
					--retry;
					console.log(retry);
					if (retry > 0) {
						return vehicle.AddVehicleModel(vmid, onSuccess, onError, retry);
					}
					console.log(xhr.response);
					onError();
				}
			});

		},
		RemoveVehicleModel: function(id) {
			var url = 'http://api.cheshibang.com/api/vehicle/RemoveVehicleModel?id=' + id;
			mui.ajax(url, {
				dataType: 'json',
				type: 'post',
				timeout: 5000,
				success: function(data) {
					console.log('remove vehicle');

					var ChildDIV = document.getElementById(id);
					ChildDIV.parentNode.removeChild(ChildDIV);

					plus.nativeUI.closeWaiting();

				},
				error: function(xhr, type, errorThrown) {

					console.log(xhr.response);
					mui.toast('删除失败！');
					plus.nativeUI.closeWaiting();
				}
			});
		},
		EditVehicleModel: function(vmid, mileage, buyVehicleDate, onSuccess, onError, retry) {
			var url = 'http://api.cheshibang.com/api/vehicle/AddVehicleModel?VMID=' + vmid + '&Mileage=' + mileage + '&date=' + buyVehicleDate;

			console.log(url);
			mui.ajax(url, {
				dataType: 'json',
				type: 'post',
				timeout: 5000,
				success: function(data) {
					console.log('edit vehicle');
					onSuccess(data);
				},
				error: function(xhr, type, errorThrown) {
					--retry;
					console.log(retry);
					if (retry > 0) {
						return vehicle.EditVehicleModel(vmid, mileage, buyVehicleDate, onSuccess, onError, retry);
					}
					console.log(xhr.response);
					onError();
				}
			});
		}

	}

	$.Vehicle = vehicle;

})(CarMaid, mui);

/*
 * Cookies
 */
(function($, mui) {

	//s20是代表20秒
	//m是指分钟，如15分钟则是：m15
	//h是指小时，如12小时则是：h12
	//d是天数，30天则：d30 
	function getsec(str) {
		var str1 = str.substring(1, str.length) * 1;
		var str2 = str.substring(0, 1);
		if (str2 == "s") {
			return str1 * 1000;
		} else if (str2 == "m") {
			return str1 * 60 * 1000;
		} else if (str2 == "h") {
			return str1 * 60 * 60 * 1000;
		} else if (str2 == "d") {
			return str1 * 24 * 60 * 60 * 1000;
		}
	}

	var cookies = {
		/*
		 *
		 */
		setCookies: function(url, name, value, time) {

			var strsec = getsec(time);
			var exp = new Date();
			exp.setTime(exp.getTime() + strsec * 1);

			var tmp = name + "=" + value + ";expires=" + exp.toGMTString() + ";path=/";
			console.log(tmp);
			plus.navigator.setCookie(url, tmp);
		},
		getCookies: function(url) {
			return plus.navigator.getCookie(url);
		},
		removeCookies: function(url) {
			plus.navigator.removeCookie(url);
		}
	};

	$.Cookies = cookies;
})(CarMaid, mui);
/*
 * UserInfo
 */
(function($, mui) {

	var USERNAME = 'username';
	var PASSWORD = 'password';
	var COOKIES_URL = 'http://api.cheshibang.com';
	var PHONE = 'userphone';

	var UserInfo = {

		Clear: function() {
			plus.storage.removeItem(USERNAME);
			plus.storage.removeItem(PASSWORD);
			$.Cookies.removeCookies(COOKIES_URL)

		},
		//检查是否包含自动登录的信息
		Auto_login: function() {
			var username = UserInfo.Username();
			var pwd = UserInfo.Password();
			if (!username || !pwd) {
				return false;
			}
			return true;
		},
		//检查是否已登录
		Has_login: function() {
			//var username = UserInfo.Username();
			//var pwd = UserInfo.Password();
			var cookie = UserInfo.LoginCookies();
			if (!cookie) {
				return false;
			}
			return true;
		},
		Username: function() {
			if (arguments.length == 0) {
				return plus.storage.getItem(USERNAME);
			}
			if (arguments[0] === '') {
				plus.storage.removeItem(USERNAME);
				return;
			}
			plus.storage.setItem(USERNAME, arguments[0]);
		},
		Password: function() {
			if (arguments.length == 0) {
				return plus.storage.getItem(PASSWORD);
			}
			if (arguments[0] === '') {
				plus.storage.removeItem(PASSWORD);
				return;
			}
			plus.storage.setItem(PASSWORD, arguments[0]);
		},
		LoginCookies: function() {
			if (arguments.length == 0) {
				return $.Cookies.getCookies(COOKIES_URL);
			}
			if (arguments[0] === '') {
				$.Cookies.removeCookies(COOKIES_URL);
				return;
			}
			$.Cookies.setCookies(COOKIES_URL, "UserID", arguments[0], 'd3'); // 三天有效期。
		},
		Phone: function() {
			if (arguments.length == 0) {
				return $.Cookies.getCookies(PHONE);
			}
			if (arguments[0] === '') {
				$.Cookies.removeCookies(PHONE);
				return;
			}
			$.Cookies.setCookies(PHONE, PHONE, arguments[0], 'd5'); // 五天有效期。
		}
	};

	$.UserInfo = UserInfo;

})(CarMaid, mui);


(function($,mui){
	var home = {
		SecKill:{
			/*
			 * 获取 秒杀类型
			 */
			GetSecKillType:function(onSuccess, onError, retry){
				var url = 'http://api.cheshibang.com/api/Home/GetSecKillType';
				mui.ajax(url,{
					dataType: 'json',
					type: 'get',
					timeout: 5000,
					success:function(data){
						onSuccess(data);
					},
					error:function(){
						--retry;
						if(retry>0){
							return home.SecKill.GetSecKillType(onSuccess, onError, retry);
						}
						onError();
					}
				});
			},
			/*
			 * 发布秒杀项
			 */
			ReleaseSeckill:function(onSuccess, onError, retry){
				var url = '';
				mui.ajax(url,{
					dataType: 'json',
					type: 'post',
					timeout: 5000,
					success:function(data){
						onSuccess(data);
					},
					error:function(){
						--retry;
						if(retry>0){
							return home.SecKill.GetSecKillType(onSuccess, onError, retry);
						}
						onError();
					}
				});
			}
		}
		
	};
	
	$.Home = home;
	
})(CarMaid, mui);
