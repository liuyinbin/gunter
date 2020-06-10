<!--整体图表-->
<template>
    <div ref="ganteview" class="ganteview-box">
        <div @scroll.passive="ganteview_scroll" class="ganteview">
            <div class="current_move_time">{{current_move_time}}</div>
            <div :style="{width:header_width+'px'}" class="ganteview-header">
                <div class="ganteview-toptime">
                    <div class="ganteview-headercell" :title="item.date" v-for="item in top_time_data"
                         :style="{width:item.width+'px',left:item.left+'px'}">{{item.date}}
                    </div>
                </div>
                <div class="ganteview-bottomtime">
                    <div class="ganteview-headercell" :title="item.title" v-for="item in bottom_time_data"
                         :style="{width:item.width+'px',left:item.left+'px',color:item.is_rest?'#999':null}">{{item.date}}
                    </div>
                </div>
            </div>
            <gante-gc-item :th_data="th_data" :start_time="start_time" :end_time="end_time" :time_1px="time_1px" :time_mode="time_mode" :style="{width:header_width+'px'}" v-if="show_item"
                           class="ganteview-content-box" :gante_data="gante_data">
                <div v-for="item in bottom_time_data" class="ganteview-column"
                     :style="{width:item.width+'px',left:item.left+'px',background:item.is_rest?'#F3FDFF':null}"></div>
                <!--<div class="gante-lines-component">-->
                    <!--<div v-for="item in lineList" class="line-container">-->
                        <!--<div :style="{left: item.short_line_left + 'px', top: item.short_line_top + 'px', height: '10px'}" class="short-h-line h-line"></div>-->
                        <!--<div :style="{left: item.row_left + 'px', top: item.row_top + 'px', width: item.row_width + 'px'}" class="row-line v-line"></div>-->
                        <!--<div :style="{left: item.long_line_left + 'px', top: item.long_line_top + 'px', height: item.long_line_height + 'px'}" class="long-h-line h-line"></div>-->
                        <!--<div class="arrow" :class="{arrow_up: !item.arrow ,arrow_down: item.arrow}" :style="{left: (item.long_line_left - 5) + 'px', top: (item.arrow ? (item.long_line_top + item.long_line_height - 5) : item.long_line_top) + 'px'}"></div>-->
                        <!--<div @click.stop="remove_before(item)" class="remove icon-69" :style="{left: item.remove_left + 'px',top: item.remove_top + 'px'}"></div>-->
                    <!--</div>-->
                <!--</div>-->
                <div :style="{width: todayInfo.width + 'px',left: todayInfo.left +'px'}" id="today-ganteview-column"></div>
                <!-- 拖动每个任务后面的圆点时出来的指示线 -->
                <!--<div class="gante-drag-line-Liu"  :style="{-->
                    <!--width: dashLine.width ? dashLine.width + 'px' : 0,-->
                    <!--left: dashLine.left ? dashLine.left + 'px' : 0,-->
                    <!--top: dashLine.top ? dashLine.top + 'px' : 0,-->
                    <!--transform: `rotate(${dashLine.scale ? dashLine.scale + 'deg' : 0})`,-->
                    <!--}"></div>-->

            </gante-gc-item>
        </div>
    </div>
</template>
<script>
    import ganteGcItem from '../gante_test/gante-gc-item.vue';
    import commitEmit from './commit.js';
    import { mapState,mapMutations } from 'vuex';
    export default {
        data() {
            return {
                one_px: 75,  //每个格子占的像素(默认为50)
                first_day: null, //开始的时间
                top_time_data: [],//顶部时间刻度
                bottom_time_data: [],//底部时间刻度
                header_width: 0, //时间组件的宽度
                future_time: 0,  //顶部时间的最大的时间
                time_1px: 0, // 1px代表的刻度
                time_mode: 0, //  显示的时间格式 时间刻度 1:日,2周,3月,4季,5年
                todayInfo:{
                    width: 0,
                    left: 0,
                }, // 当前时间的信息
                time_jiange: 0,
                show_item: false,
                requestBol:true,
                current_move_time:'',// 当前显示的时间
            }
        },
        computed:{
            ...mapState([
                'dashLine',
                'lineList'
            ]),
        },
        props: {
            gante_data: Array,
            th_data: Object,
            start_time: {}, //开始时间
            end_time: {},
        },
        methods: {
            remove_before(item){
                commitEmit.$emit('onBeforeDataChange',item.id, item.before_id,1)
            },
            ganteview_scroll(e) {
//        让左侧表格跟随滚动
                document.getElementsByClassName('gante-tbody')[0].style.top = -(e.target.scrollTop) + 'px'
                document.getElementsByClassName('ganteview-header')[0].style.left = -(e.target.scrollLeft) + 'px'
                this.$parent.show_calendar = false
                let scrollEl = e.target
                if(scrollEl.scrollHeight <= scrollEl.scrollTop + scrollEl.clientHeight && this.requestBol){
                    this.requestBol = false
                    commitEmit.$emit('on-load')
                }
                // 显示顶部移动到的当前时间
                if(scrollEl.scrollLeft >= 0){
                    for(let i of this.top_time_data){
                        if(i.left + i.width >= scrollEl.scrollLeft){
                            this.current_move_time = i.date;
                            break;
                        }
                    }
                }
            },
            /**
             *
             * @param time_mode  显示的时间格式 时间刻度 1:日,2周,3月,4季,5年
             * @returns {{start_time: Date, time: number}}
             */
            init(time_mode) {
                this.header_width = 0
//        console.log(this.start_time,this.end_time)
                var time = 0,
                    gante_width = this.$refs.ganteview.offsetWidth, //当前右边图表的宽度
                    all_time = 0,//所有的时间总和
                    start_time = null, //最小的开始时间
                    mode = 1;
                if(time_mode == 1){
                    start_time = new Date(this.start_time - (60 * 60 * 1 * 24 * 1000))
                }
                if(time_mode == 2){
                    start_time = new Date(this.start_time - (7 * 24 * 60 * 60 * 1000))
                }
                if(time_mode == 3){
                    start_time = new Date(this.start_time - (30 * 24 * 60 * 60 * 1000))
                }
                if(time_mode == 4){
                    start_time = new Date(this.start_time - (90 * 24 * 60 * 60 * 1000))
                }
                if(time_mode == 5){
                    start_time = new Date(this.start_time - (183 * 24 * 60 * 60 * 1000))
                }
                switch (time_mode) {
                    //日
                    case 1:
                        time = 60 * 60 * 1 * 24 * 1000 / this.one_px
                        this.first_day = start_time;
                        break;
                    //    周
                    case 2:
                        time = 7 * 24 * 60 * 60 * 1000 / this.one_px;
                        this.first_day = new Date(start_time.getFullYear(), start_time.getMonth(), start_time.getDate() - ((start_time.getDay() + 7) % 7))
                        start_time = this.first_day
                        break;
                    //    月
                    case 3:
                        time = 30 * 24 * 60 * 60 * 1000 / this.one_px;
                        this.first_day = new Date(start_time.getFullYear(), start_time.getMonth(), 1)
                        start_time = this.first_day
                        mode = 2
                        break;
                    //    季
                    case 4:
                        time = 90 * 24 * 60 * 60 * 1000 / this.one_px
                        let month = 0,reference_month = start_time.getMonth() + 1
                        if (reference_month >= 1 && reference_month <= 3) {
                            month = 0
                        } else if (reference_month >= 4 && reference_month <= 6) {
                            month = 3
                        } else if (reference_month >= 7 && reference_month <= 9) {
                            month = 6
                        } else if (reference_month >= 10 && reference_month <= 12) {
                            month = 9
                        }
                        this.first_day = new Date(start_time.getFullYear(), month, 1)
                        start_time = this.first_day
                        mode = 2
                        break;
                    //    年
                    case 5:
                        time = 183 * 24 * 60 * 60 * 1000 / this.one_px
                        this.first_day = new Date(start_time.getFullYear(), 0, 1)
                        start_time = this.first_day
                        mode = 2
                        break;
                }
                this.time_jiange = time
                this.show_item = true
                if (this.end_time) {
                    all_time = new Date(this.end_time).getTime()
                    if (gante_width * time >= (all_time - new Date(this.first_day).getTime())) {
                        all_time = gante_width * time + new Date(this.first_day).getTime()
                    }
                } else {
                    all_time = gante_width * time + new Date(this.first_day).getTime()
                }
                this.get_top_time(mode, this.first_day, time, all_time, time_mode)
                this.time_1px = time;
                this.time_mode = time_mode;
                return {time: time, start_time: start_time}
            },
            /**
             *  格式化时间
             * @param time 时间
             * @param mode 1：年月日 2：年月 3：日 4：月 5：年
             */
            format(time, mode) {
                var year = time.getFullYear();
                var month = time.getMonth() + 1;
                var day = time.getDate()
                if (mode == 1) {
                    return year + "-" + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day)
                } else if (mode == 2) {
                    return year + "-" + (month < 10 ? '0' + month : month)
                } else if (mode == 3) {
                    return day < 10 ? '0' + day : day
                } else if (mode == 4) {
                    return month < 10 ? '0' + month : month
                } else if (mode == 5) {
                    return year
                }
            },
             /**
             *  获取顶部时间
             * @param mode 代表是以年什么为跨度 1：月 2：年
             * @param first_time 第一个开始的时间
             * @param time 时间刻度
             * @param all_width 总的图表的宽度
             * @param time_mode 时间刻度格式
             */
            get_top_time(mode, first_time, time, all_width, time_mode) {
                 // 获取今天的位置和信息
                 this.todayInfo.width = 24*60*60*1000/time <= 5 ? 5 : 24*60*60*1000/time;
                 this.todayInfo.left = (new Date(new Date().toLocaleDateString()).getTime() - first_time.getTime())/time;
                var list = []
                for (let i = 0; i <= all_width;) {
                    var old_time = first_time, date = this.format(old_time, 2)
                    if (mode == 1) {
                        //        月的形式
                        first_time = new Date(first_time.getFullYear(), first_time.getMonth() + 1, 1)
                    } else if (mode == 2) {
                        //         年的形式
                        first_time = new Date(first_time.getFullYear() + 1, 0, 1)
                        date = this.format(old_time, 5)
                    }
                    var width = (first_time.getTime() - old_time.getTime()) / time
                    this.header_width += width
                    list.push({left: (old_time.getTime() - this.first_day.getTime()) / time, width: width, date: date})
                    i = first_time.getTime()
                    this.future_time = i
                }
                this.top_time_data = list;

                if (this.future_time) {
                    all_width = this.future_time
                }
                this.get_bottom_time(time_mode, this.first_day, time, all_width)
            },
//      获取底部时间
            get_bottom_time(mode, first_time, time, all_width) {
                var list = []
                console.log(all_width)
                for (let i = 0; i <= all_width;) {
                    var old_time = first_time,
                        date = this.format(old_time, 3),
                        title = this.format(old_time, 1),
                        is_rest = false; //是否是双休
                    if (mode == 1) {
                        first_time = new Date(first_time.getFullYear(), first_time.getMonth(), first_time.getDate() + 1)
                        if (old_time.getDay() == 0 || old_time.getDay() == 6) {
                            is_rest = true
                        }
                    } else if (mode == 2) {
                        first_time = new Date(first_time.getFullYear(), first_time.getMonth(), first_time.getDate() + 7)
                        title = this.format(old_time, 1) + '~' + this.format(new Date(first_time.getFullYear(), first_time.getMonth(), first_time.getDate() - 1), 1)
                    } else if (mode == 3) {
                        first_time = new Date(first_time.getFullYear(), first_time.getMonth() + 1, 1)
                        date = this.format(old_time, 4)
                        title = this.format(old_time, 2)
                    } else if (mode == 4) {
                        first_time = new Date(first_time.getFullYear(), first_time.getMonth() + 3, 1)
                        date = this.get_date(old_time.getMonth(), 'month')
                        title = this.format(old_time, 1) + '~' + this.format(new Date(first_time.getFullYear(), first_time.getMonth(), 0), 1)
                    } else if (mode == 5) {
                        first_time = new Date(first_time.getFullYear(), first_time.getMonth() + 6, 1)
                        date = this.get_date(old_time.getMonth(), 'year')
                        title = this.format(old_time, 1) + '~' + this.format(new Date(first_time.getFullYear(), first_time.getMonth(), 0), 1)
                    }
                    var width = (first_time.getTime() - old_time.getTime()) / time
                    i = first_time.getTime()
                    if (i <= all_width) {
                        list.push({
                            left: (old_time.getTime() - this.first_day.getTime()) / time,
                            width: width,
                            date: date,
                            title: title,
                            is_rest: is_rest
                        })
                    }
                }
                this.bottom_time_data = list
            },
//      格式化季度或年份的上下半年
            get_date(time, mode) {
                let date = ''
                if (mode == 'month') {
                    if (time <= 2 && time >= 0) {
                        date = 'Q1'
                    } else if (time <= 5 && time >= 3) {
                        date = 'Q2'
                    } else if (time <= 8 && time >= 6) {
                        date = 'Q3'
                    } else if (time <= 11 && time >= 9) {
                        date = 'Q4'
                    }
                } else if (mode == 'year') {
                    if (time <= 5 && time >= 0) {
                        date = 'Y1'
                    } else if (time <= 11 && time >= 6) {
                        date = 'Y2'
                    }
                }
                return date
            }
        },
        components: {
            ganteGcItem
        }
    }
</script>
<style scoped lang="less">
    .ganteview-box {
        height: 100%;
        position: relative;
        overflow: hidden;
    }

    .ganteview {
        height: 100%;
        overflow: auto;
        padding-bottom: 50px;
        font-size: 13px;
        box-sizing: border-box;
    }
    .ganteview .current_move_time {
        position: absolute;
        left: 3px;
        top: 0;
        padding-left: 10px;
        line-height: 54px;
        height: 39px;
        color: #777;
        background: #fff;
        z-index: 3;
    }
    .ganteview-header {
        position: absolute;
        width: 100%;
        top: 0;
        left: 0;
        height: 54px;
        font-size: 13px;
        z-index: 2;
    }

    .ganteview-toptime, .ganteview-bottomtime {
        height: 54px;
        line-height: 54px;
        position: relative;
        background: #fff;
        /*display: flex;*/
        /*justify-content: flex-start;*/
    }

    .ganteview-bottomtime{
        height: 40px;
        line-height: 40px;
    }

    .ganteview-toptime .ganteview-headercell {
        padding-left: 4px;
        text-align: left;
    }

    .ganteview-bottomtime .ganteview-headercell {
        text-align: center;
    }


    .ganteview-column {
        position: absolute;
        top: 54px;
        border-right: 1px solid #ebeef5;
        height: calc(100% - 54px);
        z-index: 0;
        box-sizing: border-box;
    }
    #today-ganteview-column{
        position: absolute;
        top: 54px;
        height: calc(100% - 54px);
        z-index: 0;
        box-sizing: border-box;
        background: #dcecfe;
    }

    .ganteview-headercell {
        box-sizing: border-box;
        color: #666;
        border-right: 1px solid #ebeef5;
        border-bottom: 1px solid #ebeef5;
        overflow: hidden;
        word-break: break-all;
        height: 100%;
        position: absolute;
    }

    .ganteview-content-box {
        padding-top: 94px;
        border-bottom: 1px solid #ebeef5;
    }
    .gante-drag-line-Liu {
        position: absolute;
        height: 1px;
        transform-origin: 0% 0 0;
        border-top: 1px dashed #2aa9a0;
        pointer-events: none;
        z-index: 1;
    }
    .gante-lines-component{
        position: absolute;
        left: 0;
        top: 94px;
        height: calc(100% - 94px);
        width: 100%;
        box-sizing: border-box;
        .line-container{
            .h-line{
                position: absolute;
                padding: 0 2px;
                width: 1px;
                cursor: pointer;
                z-index: 2;
                &:after{
                    position: absolute;
                    content: "";
                    left: 0;
                    width: 1px;
                    height: 100%;
                    background: #69d0ca;
                }
            }
            .row-line{
                position: absolute;
                height: 1px;
                padding: 2px 0;
                cursor: pointer;
                z-index: 2;
                &:after{
                    position: absolute;
                    content: "";
                    top: 0;
                    height: 1px;
                    width: 100%;
                    background: #69d0ca;
                }
            }
            .arrow {
                position: absolute;
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                cursor: pointer;
                z-index: 2;
                &.arrow_up{
                    border-bottom: 5px solid #69d0ca;
                }
                &.arrow_down{
                    border-top: 5px solid #69d0ca;
                }
            }
            .remove{
                position: absolute;
                color: #ff1f1a;
                width: 14px;
                height: 14px;
                border-radius: 7px;
                visibility: hidden;
                background: #fff;
                cursor: pointer;
                z-index: 3;
            }
            &:hover{
                .h-line,.row-line{
                    z-index: 3;
                    &:after{
                        background: #ff1f1a;
                    }
                }
                .arrow {
                    &.arrow_up{
                        border-bottom: 5px solid #ff1f1a;
                    }
                    &.arrow_down{
                        border-top: 5px solid #ff1f1a;
                    }
                }
                .remove{
                    visibility: visible;
                }
            }
        }
    }
</style>
