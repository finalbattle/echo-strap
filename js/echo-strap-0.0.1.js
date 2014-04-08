/**
 * ***************************************************************************************************
 * echo-strap 0.0.1
 * based on Jquery & Bootstrap
 * author: zhangpeng <zhangpeng820213@gmail.com>
 * date:2013-12-18
 * ***************************************************************************************************
 */


(function ($) { 

/**
 * ***************************************************************************************************
 * 扩展JQuery函数 (jquery extend functions)
 * ***************************************************************************************************
 */

$.extend(String.prototype, {
  /**
   * 字符串格式化
   * 'test{0}{1}'.format(var1,var2);
   */
  format: function(){
    var args = arguments;
    var str = this;
    for(var i=0; i<args.length; i++){
      var re = new RegExp('\\{' + i + '\\}','gm');
      str = str.replace(re, args[i]);
    }
    return str
  },
  parseQueryString: function(){
    var str=this;
    var items=str.split("&");
    var result={}
    var arr=null;
    for(var i=0; i<items.length; i++){
      var reg = new RegExp(/(\w+)?(=)?(\S+)?/gi)
      arr = reg.exec(items[i])
      if (!$defined(arr[1])){
          result[""] = arr[3];
      }else if(!$defined(arr[2])){
          //result[""] = arr[0];
      }else if (!$defined(arr[3])){
          result[arr[1]] = "";
      }else{
        result[arr[1]]=arr[3];
      }
    }
    return result;
  }
})

/**
 * 拖动效果
 * $('#id').drags();
 */
$.fn.drags = function(opt) {
    opt = $.extend({
        handle: "",
        cursor: "move",
        draggableClass: "draggable",
        activeHandleClass: "active-handle"
    }, opt);

    var $selected = null;
    var $elements = (opt.handle === "") ? this : this.find(opt.handle);

    $elements.css('cursor', opt.cursor).on("mousedown", function(e) {
        if(opt.handle === "") {
            $selected = $(this);
            $selected.addClass(opt.draggableClass);
        } else {
            $selected = $(this).parent();
            $selected.addClass(opt.draggableClass).find(opt.handle).addClass(opt.activeHandleClass);
        }
        var drg_h = $selected.outerHeight(),
            drg_w = $selected.outerWidth(),
            pos_y = $selected.offset().top + drg_h - e.pageY,
            pos_x = $selected.offset().left + drg_w - e.pageX;
        $(document).on("mousemove", function(e) {
            $selected.offset({
                top: e.pageY + pos_y - drg_h,
                left: e.pageX + pos_x - drg_w
            });
        }).on("mouseup", function() {
            $(this).off("mousemove"); // Unbind events from document
            if ($selected !== null) {
                $selected.removeClass(opt.draggableClass);
                $selected = null;
            }
        });
        e.preventDefault(); // disable selection
    }).on("mouseup", function() {
        if(opt.handle === "") {
            $selected.removeClass(opt.draggableClass);
        } else {
          if($selected) $selected.removeClass(opt.draggableClass)
                .find(opt.handle).removeClass(opt.activeHandleClass);
        }
        $selected = null;
    });
    return this;
};

/**
 * 保持窗口始终在屏幕内
 */
$.fn.stick = function(options){
  var pos = 'bottomleft'; var edge = 'topleft'; var rel = $(document.body);
  var animate = true;
  // if need shadow, do shadow
  //if(options && options.animate) animate = options.animate;
  options = options || {}
  animate = options.animate === false ? false:true;
  if(options && options.modal && !$chk(this.shadow)) this.createShadow();
  if(options && options.position) pos = options.position;
  if(options && options.edge) edge = options.edge;
  if(options && options.relativeTo) rel = options.relativeTo;
  else if(options && options.event) rel = options.event.target || options.event.srcElement;
  if (rel == $(document.body)) { pos = 'center'; edge = 'center'; }
  //this.position({position:pos,edge:edge,relativeTo:rel});
  this.css({position:"absolute", "z-index":"65520"}).appendTo($(rel))
  this.show();
  if(options && options.offset){
      if(options.offset.x) this.css("left", this.css('left').toInt() + options.offset.x + 'px');
      if(options.offset.y) this.css("top", this.css('top').toInt() + options.offset.y + 'px');
  }
  if (!options || !options.allowOutWindow) {
      // see if out of screen, if out, move it in the window
      var winscroll = {y:$(window).scrollTop(), x:$(window).scrollLeft()};
      var winsize = {x:$(window).width(), y:$(window).height()}
      var size = {width: parseInt(this.css("width")), height: parseInt(this.css("height"))}
      var center_pos = {left:(winsize.x-parseInt(size.width))/2+winscroll.x, top:(winsize.y-parseInt(size.height))/2+winscroll.y}
      //var center_pos = {left:(winsize.x-winscroll.y-size.width)/2, top:(winsize.y-winscroll.y-size.height)/2}
      if (animate == false){
        this.offset(center_pos)
      }else{
        this.css({top:winscroll.y-size.height, left:center_pos.left, opacity:"0.1"})
        this.animate({top:center_pos.top, left:center_pos.left, opacity:"1"}, "slow")
      }
      var dim = {left:this.offset().left, top:this.offset().top, width:parseInt(this.css("width")), height:parseInt(this.css("height")), bottom:parseInt(this.css("height"))+this.offset().top, right:this.offset().left + parseInt(this.css("width"))}
      var pos = { x: center_pos.left, y: center_pos.top }; var chg_pos = false;
      if (dim.left < 0) { pos.x = 0; chg_pos = true; }
      //else if (dim.width < winsize.x && dim.right > winscroll.x + winsize.x) {
      else if (dim.width < winsize.x && dim.right > winscroll.x + winsize.x) {
              pos.x = winscroll.x + winsize.x - dim.width -5; chg_pos = true;
      }
      if(dim.top < 0){ pos.y = 0; chg_pos = true; }
      else if (dim.height < winsize.y && dim.bottom > winscroll.y + winsize.y) {
          // make sure the title bar in the window
          if (winsize.y > dim.height) pos.y = winscroll.y + winsize.y - dim.height;
          chg_pos = true;
      }
      if (chg_pos) {
        this.offset({left:pos.x,top:pos.y});
        //if (animate == false){
        //}else{
        //  this.css({top:"0px"})
        //  this.animate({top:pos.y, left:pos.x, opacity:"1"}, "slow")
        //}
      }
  }
  return this;
}
$.fn.createShadow = function(){
  var shadow = $(".gShadow");
  if (shadow.length > 0) return false;
  var shadow = $(document.createElement("div"))
  shadow.addClass("gShadow")
        .attr({style:'z-index:65520;background:#fff;filter:alpha(opacity=80);opacity:0.8;width:100%;height:100%;'})
  shadow.css('position','fixed'); shadow.css('left',0); shadow.css('top',0);
  shadow.css('display','none');
  shadow.appendTo($(document.body)); shadow.css('display',''); this.shadow = shadow;
  if ($isBrowser() == "IE") {
    //var winSize = window.getScrollSize();
    var winSize = {x:$(window).scrollTop(), y:$(window).scrollLeft()};
    var frm = $(document.createElement("iframe"))
    frm.addClass('gShadow').attr({style:"z-index:65520;position:absolute;top:0;left:0;filter:mask();width:100%;height:100%;"})

    //frm.css({ 'width':winSize.x, 'height':winSize.y });

    frm.appendTo($(document.body));
  }
}

$.fn.fshow = function(options){
  var options = options || {};
  var handle = null;
  if(options.handle) handle = options.handle;
  else if(options.handle_class) handle = this.find('.' + options.handle_class);
  else handle = this.find('.title');
  var rel = $(document.body);
  if(options.relativeTo) rel = options.relativeTo;
  if(options.event) rel = options.event.target || options.event.srcElement;
  // check if is child of body, if not, move to body
  var parent = this.parent();
  if(!$ifBody(parent)) this.appendTo($(document.body));
  options.relativeTo = rel;
  this.stick(options);
  //if($chk2(handle)) var dragg = new Draggable({handle:handle,container:this});
  if (options.drag_handle) $(this).drags({handle:options.drag_handle});
}

$.fn.tClose = function(){
  //this.remove();
  var self = this;
  this.animate({top:"0px", opacity:"0"}, "slow", function(){self.remove();})
  try{
    delete this;
    $(".modal-backdrop").remove();
    delete $('.modal-backdrop');
    $("body").removeClass("modal-open")
  }catch(e){}
  try{
    $(".gShadow").remove();
    delete $(".gShadow");
    $("div.gShadow").remove();
    delete $("div.gShadow");
  }catch(e){}
}

$.fn.tHide = function(){
  //this.css("display", "none");
  var self = this;
  this.animate({top:"0px", opacity:"0"}, "slow", function(){self.css("display", "none");})
  try{
    delete this;
    $(".modal-backdrop").remove();
    delete $('.modal-backdrop');
  }catch(e){}
  try{
    $(".gShadow").remove();
    delete $(".gShadow");
    $("div.gShadow").remove();
    delete $("div.gShadow");
  }catch(e){}
}

$.fn.tShow = function(){
  this.css("display", "block");
}

$.fn.tLoading = function(_loading_text){
  this.attr("disabled", "disabled");
  this.css("opacity", "0.5")
  text = this.text() || this.val()
  this.attr("origin_text", text)
  loading_text = this.attr("loading_text") || "loading..."
  if (_loading_text) loading_text = _loading_text;
  try{
    this.text(loading_text)
  }catch(e){
    this.attr("text", loading_text)
  }
  this.val(loading_text)
  try{
    if (this[0].tagName.toLowerCase() == "a"){
      this.html(loading_text)
      this.after("<a href='javascript:;'>"+loading_text+"</a>")
      this.css('display', 'none');
    }
  }catch(e){}
}

$.fn.tReset = function(){
  this.removeAttr("disabled")
  this.css("opacity", "")
  try{
    this.text(this.attr("origin_text"))
  }catch(e){
    this.attr("text", this.attr("origin_text"))
  }
  this.val(this.attr("origin_text"))
  try{
    if (this[0].tagName.toLowerCase() == "a"){
      this.next().remove()
      this.css('display', '');
    }
  }catch(e){}
}

$.fn.tComplete = function(_complete_text){
  this.removeAttr("disabled")
  this.css("opacity", "")
  complete_text = this.attr("complete_text") || "complete"
  if (_complete_text) complete_text = _complete_text
  try{
    this.text(complete_text)
  }catch(e){
    this.attr("text", complete_text)
  }
  this.val(complete_text)
  try{
    if (this[0].tagName.toLowerCase() == "a"){
      this.next().remove()
      this.css('display', '');
    }
  }catch(e){}
}


/**
 * ***************************************************************************************************
 * 自定义扩展函数 (custom functions)
 * ***************************************************************************************************
 */
$isBrowser = function(){ 
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
    (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
    (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

    if (Sys.ie) return "IE";
    if (Sys.firefox) return "FIREFOX"; 
    if (Sys.chrome) return "CHROME";
    if (Sys.opera) return "Opera";
    if (Sys.safari) return "Safari"; 
} 

$chk = function(obj){
  if(obj == undefined) return false;
  if(obj == null) return false;
  if(obj == '') return false;
  return !!(obj || obj === 0)
}
$defined = function(arg){
  return !(typeof(arg) == 'undefined');
};
function $ifBody(element){
  if(!$chk(element)) return false;
  return (/^(?:body|html)$/i).test(element.tagName);
}

$getChkVals = function(parent, chkall){
    var ptable = $(parent); var ids = []; chkall = $(chkall);
    var childs = ptable.find("input");
    for (var i = 0; i < childs.length; i++) {
      var child = $(childs[i]);
      if($chk(chkall)){
        if (child.prop("checked") == true && child != chkall)  ids.push(child.val());
      }else{
        if (child.prop("checked") == true)  ids.push(child.val());
      }
    }
    return ids;
}
$generateId = function(options){
  options = options || {}
  var _length = 5;
  var _randomStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var random_id = "";
  if ($defined(options.length) && options.length>=0) _length = options.length;
  if ($defined(options.randomStr) && options.randomStr!='') _randomStr = options.randomStr;
  for( var i=0; i < _length; i++ )
      random_id += _randomStr.charAt(Math.floor(Math.random() * _randomStr.length));
  return random_id;
};
$GenerateId = function(options){ return new $GenerateId.fn.init(options); }; $GenerateId.fn = $GenerateId.prototype = {
  _options: null, _length: 5, 
  _randomStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  _randomInt: '1234567890',
  random_id: "",
  init: function(options){
    options = options || {}
    this._options = options;
    if ($defined(options.length) && options.length>=0) this._options.length = this._length = options.length;
    if ($defined(options.randomStr) && options.randomStr!='') this._options.randomStr = this._randomStr = options.randomStr;
  },
  generateStr: function(){
    for( var i=0; i < this._length; i++ )
        this.random_id += this._randomStr.charAt(Math.floor(Math.random() * this._randomStr.length));
    return this.random_id;
  },
  generateNum: function(){
    for( var i=0; i < this._length; i++ )
        this.random_id += this._randomInt.charAt(Math.floor(Math.random() * this._randomInt.length));
    return parseInt(this.random_id);
  }
}; $GenerateId.fn.init.prototype = $GenerateId.fn;

$cookie = function(name, value, options) {
  if (typeof value != 'undefined') {
    options = options || {};
    if (value === null) {
      value = '';
      options = $.extend({}, options);
      options.expires = -1;
    }
    var expires = '';
    if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
      var date;
      if (typeof options.expires == 'number') {
        date = new Date();
        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      } else {
        date = options.expires;
      }
      expires = '; expires=' + date.toUTCString();
    }
    var path = options.path ? '; path=' + (options.path) : '';
    var domain = options.domain ? '; domain=' + (options.domain) : '';
    var secure = options.secure ? '; secure' : '';
    document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else {
      var cookieValue = null;
      if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        if (cookie.substring(0, name.length + 1) == (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
};

/**
 * ***************************************************************************************************
 * 扩展自定义类 (custom classes)
 * ***************************************************************************************************
 */

/**
 * 弹出框
 * $MsgBox({appendTo:"div.container.theme-showcase").show();
 */
$MsgBox = function(options){ return new $MsgBox.fn.init(options); }; $MsgBox.fn = $MsgBox.prototype = {
  _options: {}, _id: null, _title: null, _message: null, _appendTo: null, _buttons:[], _footer: "show", _closeBtn: "show",
  _modal_dialog: null, _moveSpeed: null, _backdrop: 'static',
  /**
   * init options
   */
  init: function(options){
    options = options || {}
    this._options = options || {};
    this._id = this._options.id = options.id || $GenerateId().generateStr();
    this._message = this._options.message = options.message || "";
    this._title = this._options.title = options.title || "消息提示";
    this._appendTo = this._options.appendTo = options.appendTo || "div.container";
    this._moveSpeed = this._options.moveSpeed = options.moveSpeed || null;
    this._backdrop = this._options.backdrop = options.backdrop || 'static';
    this._buttons = this._options.buttons = options.buttons || [];
    this._footer = this._options.footer = options.footer || "show";
    this._closeBtn = this._options.closeBtn = options.closeBtn || "show";
    this._shadow = this._options.shadow = options.shadow || "show";
    this.createBox();
    return this;
  },
  /**
   * 生成对话框
   */
  createBox: function(){
    var div = document.createElement("div");
    var self = this;
    $(div).addClass("modal")
          .attr({id:this._id, 
                 tabindex:-1, 
                 role:"dialog", 
                 "aria-labelledby":"myModalLabel",
                 "aria-hidden":"true", 
                 style:"display:none"})
    if (this._moveSpeed!=null) $(div).addClass("fade")
    var modal_dialog = document.createElement("div"); 
      $(modal_dialog).addClass("modal-dialog").appendTo($(div));
    var modal_content = document.createElement("div"); 
      $(modal_content).addClass("modal-content").appendTo($(modal_dialog));
    var modal_header = document.createElement("div"); 
      $(modal_header).addClass("modal-header").appendTo($(modal_content));
    $(div).drags({handle:modal_header});
    if(this._closeBtn == "show"){
      var button = document.createElement("button");
      $(button).addClass("close")
            //.attr({type:"button", 
            //       "data-dismiss":"modal", 
            //       "aria-hidden":"true"})
            .text("×")
            .bind("click", function(){
              $("#"+self._id).tClose();
            })
            .appendTo($(modal_header));
    }
    var h4 = document.createElement("h4");
    $(h4).addClass("modal-title")
          .attr({id:"myModalLabel"})
          .text(this._options.title)
          .appendTo($(modal_header));
    var modal_body = document.createElement("div");
      $(modal_body).addClass("modal-body").html(this._options.message).appendTo($(modal_content));
    if (this._footer == "show"){
      var modal_footer = document.createElement("div");
        $(modal_footer).addClass("modal-footer").appendTo($(modal_content));
    }
    $(div).appendTo(this._options.appendTo);
    this._modal_dialog = $(div);
    this.appendButtons(this._buttons);
    return this;
  },
  /**
   * 设置标题
   */
  setTitle: function(_title){
    this._modal_dialog.find(".modal-title").html(_title);
    return this;
  },
  appendButtons: function(buttons){
    try{this._modal_dialog.find('div.modal-footer').find("button").remove()}catch(e){}
    var button_close = document.createElement("button");
    var modal_footer = this._modal_dialog.find('div.modal-footer');
    if (buttons.length == 0){
      $(button_close).addClass("btn btn-primary")
            .attr({type:"button", "data-dismiss":"modal"})
            .text("确定")
            .appendTo($(modal_footer));
    }else{
      for(var i=0;i<buttons.length;i++){
        var btn = buttons[i];
        var button = document.createElement("button");
        var btn_id = btn.id || $GenerateId().generateStr();
        var loading_text = btn.loading_text || "";
        $(button).addClass("btn btn-primary")
              .attr({type:"button", id:btn_id, "data-loading-text":loading_text})
              .text(btn.text)
              .bind("click", btn.action)
              .appendTo($(modal_footer));
      }
    }
    return this;
  },
  /**
   * 设置内容
   */
  setHtml: function(_html){
    this._modal_dialog.find(".modal-body").html(_html);
    return this;
  },
  fillHtml:function(_html){
    this._modal_dialog.find(".modal-header").after(_html);
    return this;
  },
  /**
   * 显示弹出框
   */
  show: function(){
    //$('#'+this._options.id).modal("show");
    $('#'+this._options.id).modal({backdrop:this._backdrop});
    var winsize = {x:$(window).width(), y:$(window).height()}
    var self = this;
    if (self._modal_dialog.find(".modal-body").html() == "") self._modal_dialog.find(".modal-body").css("display", "none");
    if (this._moveSpeed!=null){
      $('#'+this._options.id).on('shown.bs.modal', function(e){
        var _height = $(this).find('div.modal-dialog').css('height');
        var _top = (winsize.y - parseInt(_height)) / 2;
        $(this).find('div.modal-dialog').animate({top:_top}, self._moveSpeed);
      })
    }else{
      var _height = $('#'+this._options.id).find('div.modal-dialog').css('height');
      var _top = (winsize.y - parseInt(_height)) / 2;
      if (_top < 0) _top = 0;
      $('#'+this._options.id).find('div.modal-dialog').css('top', _top);
    }
    if (this._shadow != "show") $(".modal-backdrop").remove();
    return this;
  }
}; $MsgBox.fn.init.prototype = $MsgBox.fn;


/**
 * 工具提示窗口
 * ToolBox
 */
$ToolBox = function(options){ return new $ToolBox.fn.init(options); }; $ToolBox.fn = $ToolBox.prototype = {
  _options: {}, _id: null, _title: null, _message: null, _appendTo: null, _direction: null, _html: null, _buttons:[],
  _toolbox_dialog: null, _stick: false, _arrow: false,
  init: function(options){
    options = options || {};
    this._options = options || {};
    var _generate_id = $GenerateId({length:10}).generateStr();
    this._id = this._options.id = options.id || _generate_id;
    this._message = this._options.message = options.message || "";
    this._html = this._options.html = options.html || "<div>&nbsp;</div>";
    this._title = this._options.title = options.title || "Title";
    this._appendTo = this._options.appendTo = options.appendTo || "";
    this._direction = this._options.direction = this._options.placement = options.direction || options.placement || "bottom";
    this._stick = this._options.stick = options.stick || false;
    this._arrow = this._options.arrow = options.arrow || false;
    this._buttons = this._options.buttons = options.buttons || [];
    this._styles = this._options.styles = options.styles || {};
    this.createBox();
    return this;
  },
  createBox: function(){
    var self = this;
    $(this._appendTo).popover(this._options);
    $(this._appendTo).popover("show");
    var button = document.createElement("button");
    $(button).addClass("tipclose")
          //.attr({type:"button", })
          .text("×")
          //.attr({type:"button", 
          //       "data-dismiss":"alert", 
          //       "aria-hidden":"true"})
          .bind("click", function(){
            $(self._appendTo).popover("destroy");
          })
          .appendTo($("div.popover h3"));
    $(button).parent().parent().attr({id:self._id});
    this._toolbox_dialog = $("#"+this._id)
    this._toolbox_dialog.find("div.popover-content").html(this._html);
    this._toolbox_dialog.css("z-index", "1031");
    this._toolbox_dialog.css("display", "none");
    for(var item in this._styles){
      this._toolbox_dialog.css(item, this._styles[item]);
    }
    this._toolbox_dialog.removeClass("in");
    this._toolbox_dialog.drags({handle:"h3.popover-title"});
    if (this._arrow==false) this._toolbox_dialog.find('div.arrow').css('display', 'none')
    this.appendButtons(this._buttons);
  },
  setHtml: function(_html){
    this._toolbox_dialog.find("div.popover-content").html(_html);
    return this;
  },
  appendButtons: function(buttons){
    var self = this;
    try{$(self._toolbox_dialog.find("#popover-buttons").remove())}catch(e){}
    if (buttons.length > 0) this._toolbox_dialog.find("div.popover-content").append("<div id='popover-buttons' style='align:center'>")
    for(var i=0;i<buttons.length;i++){
      var btn = buttons[i];
      var button = document.createElement("button");
      $(button).addClass("btn btn-primary")
            .attr({type:"button"})
            .text(btn.text)
            .bind("click", btn.action)
      this._toolbox_dialog.find("div.popover-content #popover-buttons").append($(button))
    }
    return this;
  },
  show: function(){
    //$(this._appendTo).popover("show");
    var self = this;
    var left = 0, top = 0;
    if (self._direction == 'bottom'){
      left = parseInt($(this._appendTo).css("width")) / 2 + $(this._appendTo).position().left - parseInt(this._toolbox_dialog.css("width")) / 2;
      top = parseInt($(this._appendTo).css("height")) + $(this._appendTo).position().top;
    }
    if (self._direction == 'top'){
      left = parseInt($(this._appendTo).css("width")) / 2 + $(this._appendTo).position().left - parseInt(this._toolbox_dialog.css("width")) / 2;
      top = $(this._appendTo).position().top - parseInt(this._toolbox_dialog.css("height"));
    }
    if (self._direction == 'left'){
      left = $(this._appendTo).position().left - parseInt(this._toolbox_dialog.css("width"));
      top = parseInt($(this._appendTo).css("height")) / 2 + $(this._appendTo).position().top - parseInt(this._toolbox_dialog.css("height")) / 2;
    }
    if (self._direction == 'right'){
      left = parseInt($(this._appendTo).css("width")) + $(this._appendTo).position().left;
      top = parseInt($(this._appendTo).css("height")) / 2 + $(this._appendTo).position().top - parseInt(this._toolbox_dialog.css("height")) / 2;
    }
    this._toolbox_dialog.css("display", "block");
    this._toolbox_dialog.css("left", left);
    if (parseInt(top) != 0)
      this._toolbox_dialog.css("top", top);
    this._toolbox_dialog.addClass("in");
    self._options.relativeTo = $(this._appendTo);
    this._toolbox_dialog.stick(this._options);
    //return this;
  }
}; $ToolBox.fn.init.prototype = $ToolBox.fn;

/**
 * 警告窗口
 * AlertBox
 */
$AlertBox = function(options){ return new $AlertBox.fn.init(options); }; $AlertBox.fn = $AlertBox.prototype = {
  _options: null, id: null, _alert: "alert-warning", _opacity: 1, _appendTo: null, _html: null, _onClose: null,
  _alert_box: null, _buttons:[],
  init: function(options){
    options = options || {};
    self = this;
    this._options = options || {};
    this._id = this._options.id = options.id || null;
    this._alert = this._options.alert = options.alert || "alert-warning";
    this._opacity = this._options.opacity = options.opacity || 1;
    this._html = this._options.html = options.html || "&nbsp;";
    this._appendTo = this._options.appendTo = options.appendTo || "";
    this._buttons = this._options.buttons = options.buttons || [];
    this._onClose = this._options.onClose = options.onClose || null;
    this._dragable = this._options.draggable = options.draggable || false;
    this.createBox();
    return this;
  },
  createBox: function(){
    var div = $(document.createElement("div"));
    if (this._dragable) div.drags();
    div.addClass("alert "+ this._alert + " fade in")
        .css({opacity:this._opacity})
    if (this._id)
        div.attr({id:self._id})
    var close_button = document.createElement("button");
    $(close_button).addClass("close")
          .attr({type:"button", 
                 "data-dismiss":"alert", 
                 "aria-hidden":"true"})
          .text("×")
          .appendTo(div);
    var alert_content = $(document.createElement("div"));
    alert_content.attr({name:"alert_content"}).html(this._html);
    alert_content.appendTo(div)
    div.appendTo(this._appendTo)
    this._alert_box = div;
    this._alert_box.css("display", "none");
    this.appendButtons(this._buttons);
    return this;
  },
  appendButtons: function(buttons){
    try{this._alert_box.find("div[name=alert_content] #alert_buttons").remove()}catch(e){}
    var alert_content = this._alert_box.find("div[name=alert_content]").append("<div id='alert_buttons'>")
    //for (var btn in this._buttons){
    for (var i in buttons){
      var btn = buttons[i];
      var _btn = document.createElement("button");
      $(_btn).addClass("btn btn-primary")
            .attr({type:"button"})
            .text(btn.text)
            //.bind("click", function(){ (btn.action)(); })
            .bind("click", btn.action)
            //.appendTo(alert_content);
      alert_content.find("#alert_buttons").append($(_btn))
    }
    return this;
  },
  setHtml: function(_html){
    this._alert_box.find("div[name=alerted]").html(_html);
    return this;
  },
  show: function(){
    this._alert_box.css("display", "block");
    return this;
  },
  tHide: function(){
    self = this;
    this._alert_box.css("display", "none");
    if (this._onClose){
      (self._onClose)();
    }
    return this;
  },
  tClose: function(){
    self = this;
    this._alert_box.remove();
    if (this._onClose){
      (self._onClose)();
    }
    return this;
  },
  onClose: function(){
    self = this;
    if (this._onClose){
      (self._onClose)();
    }
    return this;
  }
}; $AlertBox.fn.init.prototype = $AlertBox.fn;


/**
 * ParamsBox
 */
$ParamsBox = function(options){ return new $ParamsBox.fn.init(options); }; $ParamsBox.fn = $ParamsBox.prototype = {
    _options:{}, _autoFire:true, _controls:[], _submitButtons:[], _extraParams:'',
    init: function(options){
        options = options || {};
        //if(!options || !options.controls) return;
        this._options = options;
        this._controls = options.controls; 
        //if(this._controls.length==0) return;
        if(options.submitButtons) this._submitButtons = options.submitButtons;
        if(options.autoFire) this._autoFire = options.autoFire;
        if(options.extraParams) this._extraParams = options.extraParams;
        this.attachEvt(); this.loadUrl();
    },
    attachEvt: function(){
        var self = this;
        var uls = this._controls;
        for(var i=0;i<uls.length;i++){
            // link buttons
            var lnks = $(uls[i]).find('a');
            for(var j=0;j<lnks.length;j++) {
                //if(!this._submitButtons.contains(lnks[j]))
                $(lnks[j]).bind('click',function(event){ self.checkMe(event); });
            }
            // input text control
            var inputs = $(uls[i]).find('input');
            for(var j=0;j<inputs.length;j++) {
                //if(!this._submitButtons.contains(inputs[j]))
                $(inputs[j]).bind('click',function(event){ self.checkMe(event); });
            }
        }
        if(this._submitButtons.length > 0)
          for(var j=0; j<this._submitButtons.length; j++){
            //this._submitButtons.each(function(item){
                var item = this._submitButtons[j]
                if(item && item.attr("type")=='button') item.bind('click',function(){ self.goUrl(); });
                // 给文本框增加回车即查询功能
                if(item && item.attr("type")=='text'){
                    item.bind('keydown',function(event){
                        if(event.key == 'enter' && !event.control && !event.shift && !event.alt){
                            self.goUrl();
                        }
                    });
                }
            };
    },
    loadUrl: function(){
        // initial all selections
        var uls = this._controls;
        for(var i=0;i<uls.length;i++) this.setState($(uls[i]).get('id'));
        // set url parameters
        var search = window.location.search.replace('?','');
        var params = search.parseQueryString();
        for(var item in params){
          this.setState(item,params[item]);
        }
    },
    getOtherUrl: function(obj){
        if(!$defined(obj)) return;if(!obj) return ''; obj = $(obj); if(!obj) return ''; var ret = '';
        if (obj.tagName.toLowerCase() != 'input') {
            var links = obj.find('a');
            for (var i = 0; i < links.length; i++) {
                if ($(links[i].parentNode).hasClass('active')) {
                    ret = links[i].get('eurl'); break;
                }
            }
        }else if(obj.type=='text' || obj.type=='hidden' || obj.type==''){
            ret = obj.get('eurl');
        }
        if(!$chk(ret)) ret = '';
        return ret;
    },
    getState: function(obj){
        if(!$defined(obj)) return;if(!obj) return '-1'; obj = $("#"+obj); if(!obj) return '-1'; var ret = '-1';
        if (obj[0].tagName.toLowerCase() != 'input') {
            var links = obj.find('a');
            for (var i = 0; i < links.length; i++) {
                if ($(links[i].parentNode).hasClass('active')) {
                    ret = $(links[i]).attr('evalue'); break;
                }
            }
        }else if(obj.attr("type")=='text' || obj.attr("type")=='hidden' || obj.attr("type")==''){
          ret = obj.val();
        }
        return ret;
    },
    setState: function(obj,value){
      if(!$defined(obj)) return;if(!obj) return; obj = $("#"+obj); if(obj.length == 0) return; if(!obj) return;
        if(obj[0].tagName.toLowerCase() != 'input'){
            if(!$defined(value)) value = '-1';
            value = value + '';
            var links = obj.find('a');
            for(var i=0;i<links.length;i++){
              if ($(links[i]).attr('evalue') == value) {
                $(links[i]).parent().addClass('active');
              } else {
                $(links[i]).parent().removeClass('active');
              }
            }
        }else{
          if (obj.attr("type") == 'text' || obj.attr("type") == 'hidden' || obj.attr("type") == '') {
            if($chk(value)) obj.val(value);
                else obj.val("");
            }
        }
    },
    checkMe: function(ev){
        ev = ev || window.event;
        var element = ev.target || ev.srcElement;
        var parent = element.parentNode.parentNode;
        var links = parent.getElementsByTagName('a');
        for(var i=0;i<links.length;i++){
            if(links[i] == element) $(links[i].parentNode).addClass('active');
            else $(links[i].parentNode).removeClass('active');
        }
        // connect to sub elements
        var uls = this._controls; var id = $(parent).attr('id');
        if($chk(id)){
            for (var i = 0; i < uls.length; i++) {
              var pname = $(uls[i]).attr('eparent');
                if($chk(pname) && pname == id){
                    this.setState(uls[i],-1);
                }
            }
        }

        if(this._autoFire)  this.goUrl();
        ev.returnValue = false;
        if(window.event) window.event.returnValue = false;
    },
    getQueryString: function(params){
      var result = [];
      for (var item in params){
        result.push("{0}={1}".format(item, params[item]));
      }
      return result.join("&");
    },
    goUrl: function(){
        var url = window.location.href.replace(window.location.search,'');
        var params = new Object(); var uls = this._controls;
        var par = this._extraParams.parseQueryString();
        for(var i in par){ 
          if($chk(i)) 
            params[i] = par[i];
        }
        //params = this._extraParams.parseQueryString();
        for(var i=0;i<uls.length;i++){
          var id = $(uls[i]).attr('id'); params[id] = this.getState(id);
          if(url=='') url = this.getOtherUrl(id);
        }
        //var _uri = url.toURI();
        //_uri.setData(params,true);
        var _uri = "{0}?{1}".format(url, this.getQueryString(params))
        window.location.href = _uri;
    }
}; $ParamsBox.fn.init.prototype = $ParamsBox.fn;

})(jQuery);

/**
*
*  Secure Hash Algorithm (SHA1)
*  http://www.webtoolkit.info/
*
**/
 
//function SHA1 (msg) {
var SHA1 = function (msg) {
 
  function rotate_left(n,s) {
    var t4 = ( n<<s ) | (n>>>(32-s));
    return t4;
  };
 
  function lsb_hex(val) {
    var str="";
    var i;
    var vh;
    var vl;
 
    for( i=0; i<=6; i+=2 ) {
      vh = (val>>>(i*4+4))&0x0f;
      vl = (val>>>(i*4))&0x0f;
      str += vh.toString(16) + vl.toString(16);
    }
    return str;
  };
 
  function cvt_hex(val) {
    var str="";
    var i;
    var v;
 
    for( i=7; i>=0; i-- ) {
      v = (val>>>(i*4))&0x0f;
      str += v.toString(16);
    }
    return str;
  };
 
 
  function Utf8Encode(string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
 
    for (var n = 0; n < string.length; n++) {
 
      var c = string.charCodeAt(n);
 
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
 
    }
 
    return utftext;
  };
 
  var blockstart;
  var i, j;
  var W = new Array(80);
  var H0 = 0x67452301;
  var H1 = 0xEFCDAB89;
  var H2 = 0x98BADCFE;
  var H3 = 0x10325476;
  var H4 = 0xC3D2E1F0;
  var A, B, C, D, E;
  var temp;
 
  msg = Utf8Encode(msg);
 
  var msg_len = msg.length;
 
  var word_array = new Array();
  for( i=0; i<msg_len-3; i+=4 ) {
    j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
    msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
    word_array.push( j );
  }
 
  switch( msg_len % 4 ) {
    case 0:
      i = 0x080000000;
    break;
    case 1:
      i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
    break;
 
    case 2:
      i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
    break;
 
    case 3:
      i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8  | 0x80;
    break;
  }
 
  word_array.push( i );
 
  while( (word_array.length % 16) != 14 ) word_array.push( 0 );
 
  word_array.push( msg_len>>>29 );
  word_array.push( (msg_len<<3)&0x0ffffffff );
 
 
  for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
 
    for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
    for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
 
    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;
 
    for( i= 0; i<=19; i++ ) {
      temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B,30);
      B = A;
      A = temp;
    }
 
    for( i=20; i<=39; i++ ) {
      temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B,30);
      B = A;
      A = temp;
    }
 
    for( i=40; i<=59; i++ ) {
      temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B,30);
      B = A;
      A = temp;
    }
 
    for( i=60; i<=79; i++ ) {
      temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B,30);
      B = A;
      A = temp;
    }
 
    H0 = (H0 + A) & 0x0ffffffff;
    H1 = (H1 + B) & 0x0ffffffff;
    H2 = (H2 + C) & 0x0ffffffff;
    H3 = (H3 + D) & 0x0ffffffff;
    H4 = (H4 + E) & 0x0ffffffff;
 
  }
 
  var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
 
  return temp.toLowerCase();
 
}

/**
*  MD5 (Message-Digest Algorithm)
**/
var MD5 = function (string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
  }
  function AddUnsigned(lX,lY) {
    var lX4,lY4,lX8,lY8,lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
    if (lX4 & lY4) { return (lResult ^ 0x80000000 ^ lX8 ^ lY8); }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) { return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);} 
      else { return (lResult ^ 0x40000000 ^ lX8 ^ lY8); }
    } else { return (lResult ^ lX8 ^ lY8); }
  }
  function F(x,y,z) { return (x & y) | ((~x) & z); }
  function G(x,y,z) { return (x & z) | (y & (~z)); }
  function H(x,y,z) { return (x ^ y ^ z); }
  function I(x,y,z) { return (y ^ (x | (~z))); }
  function FF(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function GG(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function HH(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function II(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };
  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1=lMessageLength + 8;
    var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
    var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
    var lWordArray=Array(lNumberOfWords-1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while ( lByteCount < lMessageLength ) {
      lWordCount = (lByteCount-(lByteCount % 4))/4;
      lBytePosition = (lByteCount % 4)*8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount-(lByteCount % 4))/4;
    lBytePosition = (lByteCount % 4)*8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
    lWordArray[lNumberOfWords-2] = lMessageLength<<3;
    lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
    return lWordArray;
  };
  function WordToHex(lValue) {
    var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
    for (lCount = 0;lCount<=3;lCount++) {
      lByte = (lValue>>>(lCount*8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
    }
    return WordToHexValue;
  };
  function Utf8Encode(string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) { utftext += String.fromCharCode(c); }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  };
  var x=Array();
  var k,AA,BB,CC,DD,a,b,c,d;
  var S11=7, S12=12, S13=17, S14=22; var S21=5, S22=9 , S23=14, S24=20;
  var S31=4, S32=11, S33=16, S34=23; var S41=6, S42=10, S43=15, S44=21;
  string = Utf8Encode(string); x = ConvertToWordArray(string);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  for (k=0;k<x.length;k+=16) {
    AA=a; BB=b; CC=c; DD=d;
    a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
    d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
    c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
    b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
    a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
    d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
    c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
    b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
    a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
    d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
    c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
    b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
    a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
    d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
    c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
    b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
    a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
    d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
    c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
    b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
    a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
    d=GG(d,a,b,c,x[k+10],S22,0x2441453);
    c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
    b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
    a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
    d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
    c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
    b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
    a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
    d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
    c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
    b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
    a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
    d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
    c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
    b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
    a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
    d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
    c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
    b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
    a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
    d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
    c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
    b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
    a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
    d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
    c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
    b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
    a=II(a,b,c,d,x[k+0], S41,0xF4292244);
    d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
    c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
    b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
    a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
    d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
    c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
    b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
    a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
    d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
    c=II(c,d,a,b,x[k+6], S43,0xA3014314);
    b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
    a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
    d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
    c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
    b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
    a=AddUnsigned(a,AA);
    b=AddUnsigned(b,BB);
    c=AddUnsigned(c,CC);
    d=AddUnsigned(d,DD);
  }
  var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
  return temp.toLowerCase();
}

