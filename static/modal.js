define(function(require, exports, module) {
    var $ = require("../sea-module/jquery/jquery.js");
     /**
         *创建modal
         * 
         * @param {string} type  type为模态框类型
         * @param {string} titile  title为模态框标题
         * @param {Array} items 数据格式为[{name:"",id:""}] 该数组为你要在body中添加项目的标题以及input的id
         */
    function createModal(title,items) {
        var oDiv = $("<div></div>");
        var modal = oDiv.clone().addClass("tmodal");
        var content= oDiv.clone().addClass("tmodal-content");
        var header = oDiv.clone().addClass("tmodal-header");
        var body = oDiv.clone().addClass("tmodal-body");
        var footer = oDiv.clone().addClass("tmodal-footer").html("<button class='confirm'>确认</button> <button data-dismissed='modal'>取消</button>");
        var close=$("<button class='close' data-dismissed='modal'>x</button>") 
        header.append($("<h4></h4>").text(title),close) ;
        var groups=items.map(function(item){
                 var group=oDiv.clone().addClass("tform-group");
                 var label=$("<label for='"+item.id+"'></label>").text(item.title+":");
                 var input=$("<input class='tform-control' type='text' id='"+item.id+"' name='"+item.id+"'>");
                 return group.append(label,input);
        })
        body.append(groups);
        content.append(header,body,footer);
        return modal.append(content);
    };
   
    /**
         *将创建的modal添加到页面中，并未相应的按钮添加事件
         * 
         * @param {string} titile  title为模态框标题
         * @param {Array} items 数据格式为[{name:"",id:""}] 该数组为你要在body中添加项目的标题以及input的id
         *@ return  {object} 返回创建的modal
         */
    function appendModal(title,items) { 
        var modal=createModal(title,items).addClass("hide"); 
        modal.find("[data-dismissed='modal']").on("click",function(){
        	$(".tmodal").addClass("hide");
        })
        modal.find(".conquire").on("click");
        $("body").append(modal);
        
        /**
         *获取模态框添加的数据
         *@ return  {Array} 数据格式为[{name:"",value:""}]
         */ 
        modal.getValue=function(){
             var datas=items.map(function(item){ 
             	return $("#"+item.id).val()||"";
             })
             return datas;
        }
        return modal;
    };
    module.exports= appendModal;
})
