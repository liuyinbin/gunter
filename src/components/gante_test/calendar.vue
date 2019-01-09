<template>
  <div @click.stop v-show="showCalendar" :style="{left:left+'px',top:top+'px'}" class="calendar-box">
    <input type="text" :value="value" style="display: none">
    <div class="change-time">
      <span @click.stop="changeIndex(-1,'year')" class="last"><<</span>
      <span @click.stop="changeIndex(-1,'month')" style="margin-left: 10px" class="last"><</span>
      <span>{{disp_date | day_filter}}</span>
      <span @click.stop="changeIndex(1,'year')" style="margin-left: 10px" class="next">>></span>
      <span @click.stop="changeIndex(1,'month')" class="next">></span>
    </div>
    <ul class="calendar-head">
      <li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li><li>日</li>
    </ul>
    <div v-for="(month,index) in monthList" :key="index" class="month swiper-item">
      <!--<ul v-for="(week,weekindex) in month" :key="weekindex">-->
        <li v-for="(day,dayindex) in month" @click="chooseDay(day.year,day.month,day.day,day.othermonth)">
          <div class="week-day" :class="{ischecked:checkedDay==day.date,othermonth:day.othermonth,istoday:day.istoday}">
             {{day.day}}
          </div>
        </li>
      <!--</ul>-->
    </div>
    <div class="calendar-bottom">
      <div @click="to_today" class="today-button">今天</div>
    </div>
  </div>
</template>
<script>
  export default{
    data(){
      return{
        disp_date:new Date(),
        today:new Date(),
        current_day:new Date(),
        monthList:[],
        showCalendar:false,
        checkedDay:'0000-00-00',
      }
    },
    props:{
      left:Number,
      top:Number,
      value:Boolean,
      choose_date:{
        default:new Date()
      }
    },
//    created(){
//      this.getOneMonth()
//      this.checkedDay = this.format(this.disp_date.getFullYear(),this.disp_date.getMonth(),this.disp_date.getDate())
//    },
    mounted(){
      document.addEventListener('click',this.show_calendar,false)
    },
    methods:{
      show_calendar(e){
        this.showCalendar = false
      },
      to_today(){
        this.current_day = new Date()
        this.checkedDay = this.format(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())
        this.showCalendar = false
        this.$emit('change',this.current_day)
      },
      chooseDay(year,month,day){
        this.current_day = new Date(year,month,day)
        this.checkedDay = this.format(year,month,day)
        this.showCalendar = false
        this.$emit('change',this.current_day)
      },
      format(year,month,day){
        month++
        month<10&&(month='0'+month)
        day<10&&(day='0'+day)
        return year + '-' + month + '-' + day;
      },
      getMonth(year,month){  //创建单月历
        var monthArr = []
        var dt_first = new Date(year,month,1)   //每个月第一天
        var dt_last = new Date(year,month+1,0)   //每个月最后一天
        var monthLength = dt_last.getDate()-dt_first.getDate()+1
        var daylist =[];
        var space = (dt_first.getDay() - 1 + 7) % 7   //月历前面空格
        //console.log(year,month)
        for(var i = -space;i<36;i+=7){
          var week = []
          for(var j=0;j<7;j++){
            var day = i+j+1
            if(day>0 && day<=monthLength){
              week.push({
                mode:'month',
                day:day,
                year:year,
                month:month,
                date:this.format(year,month,day),
                istoday:(this.today.getFullYear()==year && this.today.getMonth()==month && this.today.getDate() == day)?true:false,
                ischecked:false
              })
            }else{
              //其它月份
              //week.push({})
              var newdt = new Date(year,month,day)
              var _year = newdt.getFullYear()
              var _month = newdt.getMonth()
              var _day = newdt.getDate()
              week.push({
                mode:'month',
                day:_day,
                year:_year,
                month:_month,
                date:this.format(_year,_month,_day),
                ischecked:false,
                othermonth:day<=0?-1:1,
              })
            }
          }
          monthArr.push(week)
        }
        return monthArr
      },
      getOneMonth(){
        var year = this.disp_date.getFullYear()
        var month = this.disp_date.getMonth()
        this.monthList=this.getMonth(year,month)
      },
      changeIndex(index,mode){
        if(index){
          if(mode == 'month'){
            var _tmpdt = new Date(this.disp_date.getFullYear(),this.disp_date.getMonth()+index,0)
            var maxday = _tmpdt.getDate()
            var _day = maxday<this.disp_date.getDate()?maxday:this.disp_date.getDate()
            this.disp_date = new Date(this.disp_date.getFullYear(),this.disp_date.getMonth()+index,_day)
          }else if(mode == 'year'){
            var _tmpdt = new Date(this.disp_date.getFullYear()+index,this.disp_date.getMonth(),0)
            var maxday = _tmpdt.getDate()
            var _day = maxday<this.disp_date.getDate()?maxday:this.disp_date.getDate()
            this.disp_date = new Date(this.disp_date.getFullYear()+index,this.disp_date.getMonth(),_day)
          }
          this.getOneMonth()
        }
      }
    },
    watch:{
      value(val){
        this.showCalendar=val
      },
      choose_date(val){
        if(val){
          this.disp_date = this.choose_date
          this.getOneMonth()
          this.checkedDay = this.format(this.disp_date.getFullYear(),this.disp_date.getMonth(),this.disp_date.getDate())
        }
      },
      showCalendar(val){
        this.$emit('input',val)
      }
    },
    filters:{
      day_filter(value){
        if(value){
          var year = value.getFullYear()
          var month = value.getMonth()+1
          return year+'年'+month+'月'
        }
      }
    },
    destroyed(){
      document.removeEventListener('click',this.show_calendar,false)
    }
  }
</script>
<style scoped>
  .calendar-box{
    position: fixed;
    width:250px;
    z-index:1000;
    font-size: 13px;
    border: 1px solid #ebeef5 ;
    box-sizing: border-box;
    background: #fff;
    box-shadow: 1px 1px 8px #333;
  }
  .change-time{
    padding: 5px 10px;
    text-align: center;
    background: #fdf8f4;
    border-bottom: 1px solid #ebeef5;
  }
  .last{
    float: left;
    cursor: pointer;
  }
  .next{
    float: right;
    cursor: pointer;
  }
  .last:hover,.next:hover{
    background: #ccc;
  }
  .calendar-head{
    background:#00b0ff;
    display: flex;
    height:30px;
    line-height: 30px;
    color: #fff;
  }
  .calendar-head li{
    flex-grow: 1;
    text-align: center;
  }
  .swiper-item{
    height:30px;
    line-height: 30px;
    display:flex;
  }
  .month li{
    flex: 1;
    flex-grow: 1;
    overflow: hidden;
  }
  .week-day{
    font-size:12px;
    text-align: center;
    overflow: hidden;
    z-index: 1;
    cursor: default;
    transition: all .1s ease;
  }
  .calendar-bottom{
    border-top: 1px solid #ccc;
  }
  .today-button{
    width: 46px;
    height: 22px;
    line-height: 22px;
    background: #00b0ff;
    color: #fff;
    text-align: center;
    border-radius: 2px;
    margin: 5px auto;
    cursor: pointer;
  }
  .othermonth{
    color: #dcafaf;
  }
  .istoday{
    background: #06c7f3!important;
  }
  .ischecked{
    background-color: #f17117!important;
  }
</style>
