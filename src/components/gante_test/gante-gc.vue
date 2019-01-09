<template>
  <div ref="ganteview" class="ganteview-box">
    <div @scroll="ganteview_scroll" class="ganteview">
      <div :style="{width:header_width+'px'}" class="ganteview-header" >
        <div class="ganteview-toptime">
          <div class="ganteview-headercell" :title="item.date" v-for="item in top_time_data" :style="{width:item.width+'px',left:item.left+'px'}">{{item.date}}</div>
        </div>
        <div class="ganteview-bottomtime">
          <div class="ganteview-headercell" :title="item.title" v-for="item in bottom_time_data" :style="{width:item.width+'px',left:item.left+'px'}">{{item.date}}</div>
        </div>
      </div>
      <gante-gc-item :th_data="th_data" :style="{width:header_width+'px'}" v-if="show_item" class="ganteview-content-box" :gante_data="gante_data" >
        <div v-for="item in bottom_time_data" class="ganteview-column" :style="{width:item.width+'px',left:item.left+'px',background:item.is_rest?'#f5f7fa':null}"></div>
      </gante-gc-item>
    </div>
  </div>
</template>
<script>
  import ganteGcItem from '../gante_test/gante-gc-item.vue'
  export default{
    data(){
      return{
        one_px:50,  //每个格子占的像素(默认为50)
        first_day:null, //开始的时间
        top_time_data:[],//顶部时间刻度
        bottom_time_data:[],//底部时间刻度
        header_width:0, //时间组件的宽度
        future_time:0,  //顶部时间的最大的时间
        time_jiange:0,
        show_item:false,
      }
    },
    props:{
      gante_data:Array,
      th_data:Object,
      start_time:{}, //开始时间
      end_time:{},
    },
    methods:{
      ganteview_scroll(e){
//        让左侧表格跟随滚动
        document.getElementsByClassName('gante-tbody')[0].style.top = -(e.target.scrollTop)+'px'
        document.getElementsByClassName('ganteview-header')[0].style.left = -(e.target.scrollLeft)+'px'
        this.$parent.show_calendar = false
      },
//      初始化头部时间刻度
      init(time_mode){
        this.header_width = 0
        console.log(this.start_time,this.end_time)
        var time = 0,
          gante_width = this.$refs.ganteview.offsetWidth,
          all_time = 0,//所有的时间总和
          start_time = new Date(this.start_time),
          mode = 1
        switch (time_mode){
          case 1:
            time = 60*60*1*24*1000/this.one_px
            this.first_day = start_time
            break;
          case 2:
            time = 7*24*60*60*1000/this.one_px
            this.first_day = new Date(start_time.getFullYear(),start_time.getMonth(),start_time.getDate()- ((start_time.getDay()+7)%7))
            break;
          case 3:
            time = 30*24*60*60*1000/this.one_px
            this.first_day = new Date(start_time.getFullYear(),start_time.getMonth(),1)
            mode = 2
            break;
          case 4:
            time = 90*24*60*60*1000/this.one_px
            let month = 0
            if(start_time.getMonth()+1>=1 && start_time <= 3){
              month = 0
            }else if(start_time.getMonth()+1>=4 && start_time <= 6){
              month = 3
            }else if(start_time.getMonth()+1>=7 && start_time <= 9){
              month = 6
            }else if(start_time.getMonth()+1>=10 && start_time <= 12){
              month = 9
            }
            this.first_day = new Date(start_time.getFullYear(),month,1)
            mode = 2
            break;
          case 5:
            time = 183*24*60*60*1000/this.one_px
            this.first_day = new Date(start_time.getFullYear(),0,1)
            mode = 2
            break;
        }
        this.time_jiange  = time
        this.show_item = true
        if(this.end_time){
          all_time = new Date(this.end_time).getTime()
          if(gante_width*time >= (all_time - new Date(this.first_day).getTime())){
            all_time = gante_width*time + new Date(this.first_day).getTime()
          }
        }else{
          all_time = gante_width*time + new Date(this.first_day).getTime()
        }
        this.get_top_time(mode,this.first_day,time,all_time,time_mode)
        return {time:time,start_time:start_time}
      },
      format(time,mode){
        var year = time.getFullYear();
        var month = time.getMonth()+1;
        var day = time.getDate()
        if(mode == 1){
          return year + "-" + (month < 10 ? '0'+month : month) + '-' + (day < 10 ? '0'+day : day)
        }else if(mode == 2){
          return year + "-" + (month < 10 ? '0'+month : month)
        }else if(mode == 3){
          return day < 10 ? '0'+day : day
        }else if(mode == 4){
          return month < 10 ? '0'+month : month
        }else if(mode == 5){
          return year
        }
      },
//      获取顶部时间
      get_top_time(mode,first_time,time,all_width,time_mode){
        var list = []
        for(let i=0;i <= all_width;){
          var old_time = first_time,date = this.format(old_time,2)
          if(mode == 1){
            //        月的形式
            first_time = new Date(first_time.getFullYear(),first_time.getMonth()+1,1)
          }else if(mode == 2){
            //         年的形式
            first_time = new Date(first_time.getFullYear()+1,0,1)
            date = this.format(old_time,5)
          }
          var width = (first_time.getTime() - old_time.getTime())/time
          this.header_width += width
          list.push({left:(old_time.getTime()-this.first_day.getTime())/time,width:width,date:date})
          i = first_time.getTime()
          this.future_time = i
        }
        this.top_time_data = list
        if(this.future_time){
          all_width = this.future_time
        }
        this.get_bottom_time(time_mode,this.first_day,time,all_width)
      },
//      获取底部时间
      get_bottom_time(mode,first_time,time,all_width){
        var list = []
        for(let i=0;i <= all_width;){
          var old_time = first_time,date = this.format(old_time,3),title = this.format(old_time,1),is_rest = false
          if(mode == 1){
            first_time = new Date(first_time.getFullYear(),first_time.getMonth(),first_time.getDate()+1)
            if(old_time.getDay()==0||old_time.getDay()==6){
              is_rest = true
            }
          }else if(mode == 2){
            first_time = new Date(first_time.getFullYear(),first_time.getMonth(),first_time.getDate()+7)
            title = this.format(old_time,1)+'~'+this.format(new Date(first_time.getFullYear(),first_time.getMonth(),first_time.getDate()-1),1)
          }else if(mode == 3){
            first_time = new Date(first_time.getFullYear(),first_time.getMonth()+1,1)
            date = this.format(old_time,4)
            title = this.format(old_time,2)
          }else if(mode == 4){
            first_time = new Date(first_time.getFullYear(),first_time.getMonth()+3,1)
            date = this.get_date(old_time.getMonth(),'month')
            title = this.format(old_time,1)+'~'+this.format(new Date(first_time.getFullYear(),first_time.getMonth(),0),1)
          }else if(mode == 5){
            first_time = new Date(first_time.getFullYear(),first_time.getMonth()+6,1)
            date = this.get_date(old_time.getMonth(),'year')
            title = this.format(old_time,1)+'~'+this.format(new Date(first_time.getFullYear(),first_time.getMonth(),0),1)
          }
          var width = (first_time.getTime() - old_time.getTime())/time
          i = first_time.getTime()
          if(i<=all_width){
            list.push({left:(old_time.getTime()-this.first_day.getTime())/time,width:width,date:date,title:title,is_rest:is_rest})
          }
        }
        this.bottom_time_data = list
      },
//      格式化季度或年份的上下半年
      get_date(time,mode){
        let date=''
        if(mode == 'month'){
          if(time <= 2 && time >= 0){
            date = 'Q1'
          }else if(time <= 5 && time >= 3){
            date = 'Q2'
          }else if(time <= 8 && time >= 6){
            date = 'Q3'
          }else if(time <= 11 && time >= 9){
            date = 'Q4'
          }
        }else if(mode == 'year'){
          if(time <= 5 && time >= 0){
            date = 'Y1'
          }else if(time <= 11 && time >= 6){
            date = 'Y2'
          }
        }
        return date
      }
    },
    components:{
      ganteGcItem
    }
  }
</script>
<style scoped>
  .ganteview-box{
    height:100%;
    position: relative;
    overflow: hidden;
  }
  .ganteview{
    height:100%;
    overflow: auto;
  }
  .ganteview-header{
    position: absolute;
    width: 100%;
    top:0;
    left:0;
    height:44px;
    background-color: #F0F0F0;
    font-size: 13px;
    z-index:2;
  }
  .ganteview-toptime,.ganteview-bottomtime{
    height:22px;
    line-height: 22px;
    position: relative;
    /*display: flex;*/
    /*justify-content: flex-start;*/
  }
  .ganteview-toptime{
    background: #FDF8F4;
  }
  .ganteview-toptime .ganteview-headercell{
    font-weight: bold;
    padding-left: 4px;
  }
  .ganteview-bottomtime .ganteview-headercell{
    color: #fff;
    text-align: center;
  }
  .ganteview-bottomtime{
    background-color: #B5DEFC;
  }
  .ganteview-column{
    position: absolute;
    top: 44px;
    border-right: 1px solid #ebeef5;
    height: calc(100% - 44px);
    z-index: -1;
    box-sizing: border-box;
  }
  .ganteview-headercell{
    box-sizing: border-box;
    border-right:1px solid #ccc ;
    border-bottom: 1px solid #ccc;
    overflow: hidden;
    word-break: break-all;
    font-weight: bold;
    height: 100%;
    position: absolute;
  }
  .ganteview-content-box{
    padding-top: 44px;
  }
</style>
