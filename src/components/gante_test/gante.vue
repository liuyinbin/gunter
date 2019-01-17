<template>
  <div class="ganteLiuBox">
    <div ref="gante_box" :style="{height:height+'px'}" class="gante-box">
      <div :style="{width:tabe_width+'px'}" class="gante-table-box">
        <gante-table @change-calendar="change_calendar" @on-click="onclick" @change="change" :th_data="th_data" :data="ganteData"></gante-table>
      </div>
      <div class="gante-gc-box" :style="{left:tabe_width+'px'}">
        <gante-gc ref="gante_gc" :start_time="start_time" :end_time="end_time" :th_data="th_data" :gante_data="ganteData"></gante-gc>
      </div>
      <gante-split :left="tabe_width"></gante-split>
    </div>
    <calendar  :left="calendar_left" :choose_date="checkDate" v-model="show_calendar" @change="chooseDate" :top="calendar_top"></calendar>
    <div class="change-mode" @click="to_big">+ 放大</div>
    <div class="change-mode" @click="to_small">- 缩小</div>
  </div>
</template>
<script>
  import ganteTable from '../gante_test/gante-table.vue'
  import ganteGc from '../gante_test/gante-gc.vue'
  import {resize} from '../gante_test/resize'
  import ganteSplit from '../gante_test/gante-split.vue'
  import calendar from './calendar.vue'
  let number = 0  //序号
  export default{
    data(){
      return{
        tabe_width:0, //表格的宽度
        time_mode:1,//时间刻度 1:日,2周,3月,4季,5年
        th_data:{}, //表格头部数据
        ganteData:[],
        height:300,
        open:true,
        calendar_left:0,  //日期选择的位置
        calendar_top:0,//日期选择的位置
        show_calendar:false,
        checkDate:new Date(),//选中的日期
        change_id:'', //修改数据的id,修改时间用到
        change_value:'',//修改数据的值,修改时间用到
        start_time:0, //最小的开始时间
        end_time:0, //最大的结束时间
        edit_data:{},
        onEdit: () => {},
        onClick: () => {},
      }
    },
    mounted(){
//        this.showToast()
      this.$nextTick(function () {
        let gante_box =document.getElementsByClassName('gante-box')[0]
        resize.onelresize(gante_box,function () {
          document.getElementsByClassName('gante-gc-box')[0].style.width = gante_box.offsetWidth - document.getElementsByClassName('gante-table-box')[0].offsetWidth+'px'
        })
      })

    },
    methods:{
//      放大
      to_big(){
        if(this.time_mode<=4){
          this.time_mode++
          this.init({time_mode:this.time_mode},false)
        }
      },
      //     缩小
      to_small(){
        if(this.time_mode>=2){
          this.time_mode--
          this.init({time_mode:this.time_mode},false)
        }
      },
//      选择日期
      chooseDate(date){
        if(date){
          var year = date.getFullYear()
          var month = date.getMonth()+1
          var day = date.getDate()
          var time = year+'-'+(month<10?('0'+month):month)+'-'+(day<10?('0'+day):day)
          this.change_value[0].value = time
          this.change_value[1].value = new Date(year,month-1,day).getTime()
          this.change({
            change_value:{
              id:this.change_id,
              value:this.change_value
            }})
          this.init({ganteData:this.ganteData,start_time:this.start_time,end_time:this.end_time},false)
        }
      },
//      点击显示日历
      change_calendar(data){
        if(data.changeDate){
          this.checkDate = data.changeDate
        }
        this.show_calendar = data.show_calendar
        if(data.calendar_left!=undefined){
          this.calendar_left = data.calendar_left
        }
        if(data.calendar_top!=undefined){
          this.calendar_top = data.calendar_top
        }
        if(data.change_value!=undefined){
          this.change_id = data.change_value.id
          this.change_value = data.change_value.argument
        }
      },
//      监听点击事件
      onclick(data){
        if(typeof this.onClick === 'function'){
          for(let i in data.data){
            if(i == 'width'||i == 'left'||i== 'open'){
              delete data.data[i]
            }
          }
          this.onClick(data)
        }
      },
//      统一改变数据
      change(data){
        if(data.data){
            console.log(data.data)
          this.ganteData =this.objDeepCopy(data.data)
        }
        if(data.change_value){
          this.gunter_data_change(data.change_value.id,data.change_value.value,this.ganteData)
          if(typeof this.onEdit === 'function'){
            for(let i in this.edit_data.data){
              if(i == 'width'||i == 'left'||i== 'open'){
                delete this.edit_data.data[i]
              }
            }
            this.onEdit(this.edit_data)
          }
        }
      },
      gunter_data_change(id,value,data){
        for(let i of data){
          if(i.gunter_id == id){
            for(let s of value){
              if(s.mode){
                this.$set(i, s.argument, s.value)
              }
              this.$set(i['params'], s.argument, s.value)
            }
            this.edit_data['data'] = this.objDeepCopy(i)
            this.edit_data['argument'] = value[0].argument
            this.edit_data['value'] = value[0].value
          }
//          判断最小开始时间和最大结束时间
          if(this.start_time > i.start_time && (i.start_time)){
            this.start_time = i.start_time
          }
          if(this.end_time < i.end_time && i.end_time){
            this.end_time = i.end_time
          }
          if(i.children){
           this.gunter_data_change(id,value,i.children)
          }
        }
      },
      //      对象数组的深度拷贝
      objDeepCopy(source) {
        var sourceCopy = source instanceof Array ? [] : {};
        for (var item in source) {
          sourceCopy[item] = typeof source[item] === 'object' ? this.objDeepCopy(source[item]) : source[item];
        }
        return sourceCopy;
      },
//      初始化
      init(params,mode = true){
        let {ganteData, height, th_data,tabe_width, start_time, end_time, open, time_mode, onEdit, onClick} = params
        if(ganteData != undefined){
          this.ganteData = ganteData
        }
        if(height!=undefined){
          this.height = height
        }
        if(th_data != undefined){
          this.th_data = th_data
        }
        if(!this.th_data.number){
          let number = {number:{value:'序号',width:80,showToast:false,listen_click:false,weight:true}}
          this.th_data = Object.assign(number,this.th_data)
        }
        if(open!=undefined){
          this.open = open
        }
        if(time_mode!=undefined){
          this.time_mode = time_mode
        }

				if(onEdit!=undefined){
					this.onEdit = onEdit
				}

				if(onClick!=undefined){
					this.onClick = onClick
				}

        if(start_time!=undefined){
          this.start_time = start_time
        }
        if(end_time!=undefined){
          this.end_time = end_time
        }
        this.$nextTick(function () {
          let data = this.$refs.gante_gc.init(this.time_mode)
          number = 0
          this.format_gante_data(this.ganteData,data.time,data.start_time)
          if(mode){
            if(tabe_width!=undefined){
              this.tabe_width = tabe_width
            }else{
              let _width = this.$refs.gante_box.clientWidth
              this.tabe_width = _width/2
            }
          }
        })

      },
//      对数据进行处理
      format_gante_data(gante_data,time,start_time){
        for(let i of gante_data){
          if(i.start_time || i.end_time){
            i['left'] = (i.start_time - start_time)/time
            if(i.end_time && i.end_time >= i.start_time && i.start_time){
              i['width'] = (new Date(new Date(i.end_time).getFullYear(),new Date(i.end_time).getMonth(),new Date(i.end_time).getDate()+1) - i.start_time)/time
            }else{
              i['width'] = 0
            }
          }
          if(i.open == undefined){
            this.$set(i,'open',this.open)
          }
          if(i.children){
            number++
            i.params['number'] = number
            this.format_gante_data(i.children,time,start_time)
          }else{
            number++
            i.params['number'] = number
          }
        }
      }
    },
    components:{
      ganteTable,
      ganteGc,
      ganteSplit,
      calendar
    }
  }
</script>
<style>
  li{
    list-style: none;
  }
  .gante-box ::-webkit-scrollbar {
    width:5px;
    height: 5px;
  }
  .gante-box ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    background-color: #F5F5F5;
  }
  .gante-box ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, .1);
    background-color: #ccc;
  }
  .gante-box{
    width: 100%;
    border: 1px solid #ccc;
    overflow: hidden;
    box-sizing: border-box;
  }
  .gante-table-box{
    overflow-x: auto;
    overflow-y: hidden;
    width: 50%;
    left: 0;
    top:0;
    height:100%;
    position: absolute;
  }
  .gante-gc-box{
    overflow: auto;
    width: 50%;
    position: absolute;
    top:0;
    border-left: 5px solid transparent;
    height:100%;
    box-sizing: border-box;
    padding-right: 2px;
  }
  .change-mode{
    width: 65px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    display: inline-block;
    background: #00b0ff;
    border-radius: 3px;
    color: #fff;
    margin-top: 10px;
    cursor: pointer;
  }
  .gante-toast-liu{
    position: fixed;
    z-index: 10000;
    width: 250px;
    height: auto;
    font-size: 13px;
    border-radius: 3px;
    background: rgba(0,0,0,0.5);
    padding: 10px;
    color: #fff;
  }
  .unselecttable{
    -webkit-touch-callout:none;  /*系统默认菜单被禁用*/
    -webkit-user-select:none; /*webkit浏览器*/
    -khtml-user-select:none; /*早期浏览器*/
    -moz-user-select:none;/*火狐*/
    -ms-user-select:none; /*IE10*/
    user-select:none;
  }
</style>
