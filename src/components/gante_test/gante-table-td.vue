<template>
  <div>
    <div ref="cells" class="cell" @click.stop="to_edit($refs.cells,td_data)" :style="{width:th.width ? th.width+'px' : '80px',textIndent:th.shrink ? (td_data.level-1)*10+'px' : null}">
      <span style="width: 15px;display: inline-block;text-indent: 0" v-if="th.shrink">
        <span v-show="td_data.children" style="cursor: pointer;" @click.stop="opens(td_data.gunter_id)"  >
            <span v-show="!td_data.open" ><img style="width: 13px;" src="../../assets/add.png" alt=""></span>
            <span v-show="td_data.open" ><img style="width: 13px;" src="../../assets/reduce.png" alt=""></span>
        </span>
       </span>
      <span class="cell-value">{{td_data.params[key_value]}}</span>
    </div>
    <input class="gante_edit_input_liu" @click="change_calendar($refs.cells,td_data.params[key_value])" :readonly="th.chooseTime" ref="gante_input" v-if="edit" @blur="td_blur(td_data.gunter_id)" type="text" :value="td_data.params[key_value]" >
  </div>
</template>
<script>
  export default{
    data(){
      return{
        edit:false
      }
    },
    props:{
      td_data:Object,
      th:Object,
      index:Number,
      key_value:String
    },
    methods:{
    //      获取元素距离浏览器的距离
     getPos(ele){
        var p=ele.offsetParent;
        var left=ele.offsetLeft;
        var top=ele.offsetTop
        while(p){
          if(window.navigator.userAgent.indexOf("MSIE 8")>-1){
            left+=p.offsetLeft;
            top+=p.offsetTop;
          }else{
            left+=p.offsetLeft+p.clientLeft;
            top+=p.offsetTop+p.clientTop;
          }
          p=p.offsetParent;
        }
        var obj={};
        obj.x=left;
        obj.y=top;
        return obj;
      },
//      编辑任务
       to_edit(e,value){
        if(this.th.edit || this.th.chooseTime){
          this.edit = true
          if(this.th.chooseTime){
            var time = '',left = this.getPos(e.parentNode.parentNode).x,top = this.getPos(e.parentNode.parentNode).y+44,gante_table_box =  document.getElementsByClassName('gante-table-box')[0],ganteview = document.getElementsByClassName('ganteview')[0]
            if(value.params[this.key_value] == '' || value.params[this.key_value]==null){
              time = new Date()
            }else{
              if(!Number(value.params[this.key_value])){
                time = new Date(value.params[this.key_value].replace(/\-/g,'/'))
              }else{
                time = Number(value.params[this.key_value])
              }
            }
            if(gante_table_box.scrollLeft){
              left = left - gante_table_box.scrollLeft
            }
            if(ganteview.scrollTop){
              top = top - ganteview.scrollTop
            }
            this.$emit('change-calendar',{show_calendar:true,change_value:{id:value.gunter_id,argument:[{argument:this.key_value},{argument:this.th.time_mode==1?'start_time':'end_time',mode:true}]},changeDate:time,calendar_left:left,calendar_top:top})
          }else{
            this.$emit('change-calendar',{show_calendar:false})
          }
          this.$nextTick(function () {
            this.$refs.gante_input.focus()
          })
        }else{
          this.$emit('change-calendar',{show_calendar:false})
        }
      },
//      点击input时事件
      change_calendar(e){
        if(this.th.chooseTime){
          this.$emit('change-calendar',{show_calendar:true,calendar_left:e.parentNode.parentNode.offsetLeft,calendar_top:e.parentNode.parentNode.offsetTop+44})
        }
      },
      td_blur(id){
//        判断有没有修改值
        if(this.$refs.gante_input.value!=this.td_data.params[this.key_value]){
          this.$emit('change',{change_value:{id:id,value:[{argument:this.key_value,value:this.$refs.gante_input.value}]}})
        }
        this.edit = false
      },
//      展开收缩任务
      opens(id){
        this.change_open(id,this.$parent.all_data)
        this.$emit('change',{data:this.$parent.all_data})
      },
      change_open(id,data){
        for(var i of data){
          if(i.gunter_id == id){
            i.open = !i.open
            return
          }
          if(i.children){
            this.change_open(id, i.children)
          }
        }
      }
    }
  }
</script>
<style>
  .gante_edit_input_liu{
    position: absolute;
    left: 0;
    top:0;
    width: 100%;
    height:100%;
    box-sizing: border-box;
    border: 1px solid #00b0ff;
    padding: 0 5px;
    font-size: 14px;
    z-index:1000;
  }
  .cell-value{
    cursor: default;
  }
</style>
